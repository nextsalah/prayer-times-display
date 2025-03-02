// src/lib/db/services/appDataService.ts
import { db } from '$lib/db/db.server';
import { prayertimes, type PrayerTime } from '$lib/db/schemas/prayer/prayer-times.schema';
import { lt, desc, eq } from 'drizzle-orm';
import { validatePrayerTimes } from '$lib/utils/dataValidation';
import { 
  timeSettingsService,
  dateSettingsService,
  languageService
} from '$lib/db';
import { themeService } from '$lib/db';
import { Theme } from '$themes/logic/handler';
import { prayerConfigService } from '$lib/db/services/prayerconfig';
import type { SettingsFromFields } from '$themes/logic/theme-settings-manager';
import type { IField } from '@ismail424/svelte-formly';
import type { ThemeSettings } from '$lib/db/schemas';
import type { 
  Prayer, 
  PrayerSettings,
  SettingsForPrayer
} from '$lib/db/schemas/prayer/prayer-config.schema';
import type { LanguageSchemaType } from '$lib/db/schemas';

/**
 * Type definitions for API data structure
 */
interface Prayertimes {
  today: PrayerTime;
  tomorrow: PrayerTime;
  afterTomorrow: PrayerTime;
}

interface AppSettings {
  id: number;
  showQRCode: boolean;
  dateFormat: string;
  timeFormat: string;
}

const DEFAULT_THEME = "default"

export interface SinglePrayerOption {
  id: number;
  name: string;
  showIqamah: boolean;
  iqamah: number;
  iqamahAfterPrayer: boolean;
  offset: number;
  isFixed: boolean;
  fixedTime: string;
  type: string;
  // Additional fields for Fajr
  calculateIqamahFromSunrise?: boolean;
  sunriseOffset?: number;
}

export interface PrayerOptions {
  fajr: SinglePrayerOption;
  dhuhr: SinglePrayerOption;
  asr: SinglePrayerOption;
  maghrib: SinglePrayerOption;
  isha: SinglePrayerOption;
}

interface LanguageWithId extends LanguageSchemaType {
  id: number;
}

export interface ApiData<T extends IField[]> {
  prayertimes: Prayertimes;
  custom_settings: SettingsFromFields<T>;
  prayer_options: PrayerOptions;
  settings: AppSettings;
  language: LanguageWithId;
}

// Define ThemeData interface
interface ThemeData {
  value: string;
  name: string;
  description: string;
  customizationForm: IField[];
  manifest: {
    name: string;
    description: string;
    version: string;
    authors: Array<{
      name: string;
      github_profile: string;
    }>;
  };
}

// Define return type for getAppData
export interface AppDataResult<T extends IField[] = IField[]> {
  prayerTimes: {
    today: PrayerTime;
    tomorrow: PrayerTime;
    dayAfterTomorrow: PrayerTime;
  };
  apiData: ApiData<T>;
  theme: ThemeData;
  componentPath: string;
}

/**
 * AppDataService - A service that provides unified access to all application data
 * with robust error handling and fallbacks
 */
export class AppDataService {
  // Default values for prayer times when data is unavailable
  private static readonly DEFAULT_PRAYER_TIMES: Omit<PrayerTime, 'id'> = {
    date: new Date(),
    fajr: '05:00',
    sunrise: '06:30',
    dhuhr: '12:00',
    asr: '15:30',
    maghrib: '18:00',
    isha: '19:30'
  };

  /**
   * Get complete API data for display in the UI
   */
  async getAppData(): Promise<AppDataResult> {
    try {
      // Get all settings in parallel with proper error handling
      const [
        themeSettingsResult,
        languageResult,
        prayerConfigResult,
        timeSettingsResult,
        dateSettingsResult,
        prayerTimesResult
      ] = await Promise.allSettled([
        this.getThemeSettings(),
        this.getLanguageSettings(),
        this.getPrayerConfig(),
        this.getTimeSettings(),
        this.getDateSettings(),
        this.getPrayerTimes()
      ]);
      // Extract results with fallbacks
      const themeSettings = this.extractSettledResult(themeSettingsResult, themeService.getDefaultSettings());
      const language = this.extractSettledResult(languageResult, this.getDefaultLanguage());
      const prayerConfig = this.extractSettledResult(prayerConfigResult, this.getDefaultPrayerConfig());
      const timeSettings = this.extractSettledResult(timeSettingsResult, { use24Hour: true, timezone: 'UTC' });
      const dateSettings = this.extractSettledResult(dateSettingsResult, { dateFormat: 'YYYY-MM-DD' });
      const prayerTimes = this.extractSettledResult(prayerTimesResult, this.getDefaultPrayerTimes());
      // Load theme safely
      const theme = await this.loadTheme(themeSettings.themeName);
      
      // Format prayer options using the current language
      const prayerOptions = this.formatPrayerOptions(prayerConfig, language);
      
      // Parse custom settings with error handling
      const customSettings = this.parseCustomSettings(themeSettings.customSettings);
      
      // Format app settings
      const appSettings: AppSettings = {
        id: 1,
        showQRCode: themeSettings.showQrCode,
        dateFormat: dateSettings.dateFormat,
        timeFormat: timeSettings.use24Hour ? '24h' : '12h',
      };
      
      // Add id to language settings for the frontend
      const languageWithId: LanguageWithId = {
        ...language,
        id: 1
      };
      
      // Construct API data for the theme
      const apiData: ApiData<typeof theme.themeData.customizationForm> = {
        prayertimes: {
          today: prayerTimes.today,
          tomorrow: prayerTimes.tomorrow,
          afterTomorrow: prayerTimes.dayAfterTomorrow
        },
        custom_settings: customSettings,
        prayer_options: prayerOptions,
        settings: appSettings,
        language: languageWithId
      };
      
      return {
        prayerTimes,
        apiData,
        theme: theme.themeData,
        componentPath: themeSettings.themeName
      };
    } catch (error) {
      console.error('Fatal error in getAppData:', error);
      throw new Error('Unable to load application data');
    }
  }
  
  /**
   * Get app data with a specific theme override
   */
  async getAppDataWithTheme(themeId: string): Promise<AppDataResult | null> {
    try {
      const data = await this.getAppData();
      const theme = await Theme.load(themeId);
      
      if (theme instanceof Error) {
        return null;
      }

      return {
        ...data,
        theme: theme.themeData,
        componentPath: themeId
      };
    } catch (error) {
      console.error('Error getting app data with theme:', error);
      return null;
    }
  }

  /**
   * Get theme settings with error handling
   */
  private async getThemeSettings(): Promise<Omit<ThemeSettings, 'id'>> {
    try {
      return await themeService.get();
    } catch (error) {
      console.error('Error getting theme settings:', error);
      return themeService.getDefaultSettings();
    }
  }
  
  /**
   * Get language settings with error handling
   */
  private async getLanguageSettings(): Promise<LanguageSchemaType> {
    try {
      return await languageService.get();
    } catch (error) {
      console.error('Error getting language settings:', error);
      return this.getDefaultLanguage();
    }
  }
  
  /**
   * Get prayer configuration with error handling
   */
  private async getPrayerConfig(): Promise<PrayerSettings> {
    try {
      return await prayerConfigService.getAll();
    } catch (error) {
      console.error('Error getting prayer config:', error);
      return this.getDefaultPrayerConfig();
    }
  }
  
  /**
   * Get time settings with error handling
   */
  private async getTimeSettings() {
    try {
      return await timeSettingsService.get();
    } catch (error) {
      console.error('Error getting time settings:', error);
      return { use24Hour: true, timezone: 'UTC' };
    }
  }
  
  /**
   * Get date settings with error handling
   */
  private async getDateSettings() {
    try {
      return await dateSettingsService.get();
    } catch (error) {
      console.error('Error getting date settings:', error);
      return { dateFormat: 'YYYY-MM-DD' };
    }
  }
  
  /**
   * Safely extract result from Promise.allSettled
   */
  private extractSettledResult<T>(result: PromiseSettledResult<T>, fallback: T): T {
    return result.status === 'fulfilled' ? result.value : fallback;
  }
  
  /**
   * Load theme with fallback to default
   */
  private async loadTheme(themeName: string) {
    try {
      const theme = await Theme.load(themeName);
      if (theme instanceof Error) {
        console.error('Failed to load theme:', theme);
        const defaultTheme = await Theme.load(DEFAULT_THEME);
        if (defaultTheme instanceof Error) {
          throw new Error('Failed to load default theme');
        }
        return defaultTheme;
      }
      return theme;
    } catch (error) {
      console.error('Fatal error loading themes:', error);
      throw new Error('Unable to load any theme');
    }
  }
  
  /**
   * Parse custom settings with error handling
   */
  private parseCustomSettings(customSettingsJson: string): any {
    try {
      return JSON.parse(customSettingsJson || '{}');
    } catch (error) {
      console.error('Error parsing custom settings:', error);
      return {};
    }
  }
  
  /**
   * Format date string for database queries in different formats
   */
  private formatDateStrings(date: Date): string[] {
    // Format 1: YYYY-MM-DD (ISO format)
    const isoDate = date.toISOString().split('T')[0];
    
    // Format 2: MM-DD (month-day only)
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const monthDayFormat = `${month}-${day}`;
    
    return [isoDate, monthDayFormat];
  }
  
  /**
   * Get prayer times with robust error handling and multiple date formats
   */
  private async getPrayerTimes() {
    try {
      const now = new Date();
      const dateFormats = this.formatDateStrings(now);
      
      // Try to get prayer times for today with full date format
      let prayerTimesList = await this.tryGetPrayerTimesByDateFormat(dateFormats[0]);
      
      // If that fails, try with just month-day format
      if (!prayerTimesList || prayerTimesList.length < 3) {
        console.log(`No prayer times found for ${dateFormats[0]}, trying ${dateFormats[1]}`);
        prayerTimesList = await this.tryGetPrayerTimesByDateFormat(dateFormats[1], true);
      }
      
      // If that also fails, get the most recent prayers
      if (!prayerTimesList || prayerTimesList.length < 3) {
        console.log(`No prayer times found for specific dates, getting most recent`);
        prayerTimesList = await db.query.prayertimes.findMany({
          orderBy: [desc(prayertimes.date)],
          limit: 3,
        });
      }
      
      // If still no results, use defaults
      if (!prayerTimesList || prayerTimesList.length < 3) {
        console.warn('Insufficient prayer times found, using defaults');
        return this.getDefaultPrayerTimes();
      }
      
      const validatedPrayerTimesList = validatePrayerTimes(prayerTimesList);
      
      return {
        today: validatedPrayerTimesList[0],
        tomorrow: validatedPrayerTimesList[1],
        dayAfterTomorrow: validatedPrayerTimesList[2]
      };
    } catch (error) {
      console.error('Error getting prayer times:', error);
      return this.getDefaultPrayerTimes();
    }
  }
  
  /**
   * Try to get prayer times using a specific date format
   */
  private async tryGetPrayerTimesByDateFormat(datePattern: string, isPartial = false) {
    try {
      // For partial matching (e.g. MM-DD without year)
      if (isPartial) {
        return await db.query.prayertimes.findMany({
          where: (fields, { sql }) => sql`CAST(${fields.date} AS TEXT) LIKE ${'%' + datePattern + '%'}`,
          limit: 3,
        });
      }
      
      // For exact date matching
      return await db.query.prayertimes.findMany({
        where: (fields, { sql }) => sql`DATE(${fields.date}) = ${datePattern}`,
        limit: 3,
      });
    } catch (error) {
      console.error(`Error querying with date format ${datePattern}:`, error);
      return [];
    }
  }
  
  /**
   * Create default prayer times as fallback
   */
  private getDefaultPrayerTimes() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    const createDefaultDay = (date: Date): PrayerTime => ({
      ...AppDataService.DEFAULT_PRAYER_TIMES,
      id: 0,
      date
    });
    
    return {
      today: createDefaultDay(now),
      tomorrow: createDefaultDay(tomorrow),
      dayAfterTomorrow: createDefaultDay(dayAfter)
    };
  }
  
  /**
   * Get default language settings
   */
  private getDefaultLanguage(): LanguageSchemaType {
    return {
      language_code: 'en',
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
      prayer: 'Prayer',
      iqamah: 'Iqamah',
      begins: 'Begins',
      next: 'Next'
    };
  }
  
  /**
   * Convert prayer configuration to PrayerOptions format using language settings
   */
  private formatPrayerOptions(prayerConfig: PrayerSettings, language: LanguageSchemaType): PrayerOptions {
    const createPrayerOption = (prayer: Prayer, config: SettingsForPrayer<typeof prayer>): SinglePrayerOption => {
      // Create base prayer option
      const option: SinglePrayerOption = {
        id: 1,
        name: language[prayer] || prayer.charAt(0).toUpperCase() + prayer.slice(1),
        showIqamah: config.showIqamah,
        iqamah: config.iqamah,
        iqamahAfterPrayer: false, // Default value if not in schema
        offset: config.offset,
        isFixed: config.isFixed,
        fixedTime: config.fixedTime,
        type: prayer
      };
      
      // Add Fajr-specific fields if applicable
      if (prayer === 'fajr' && 'calculateIqamahFromSunrise' in config) {
        option.calculateIqamahFromSunrise = config.calculateIqamahFromSunrise;
        option.sunriseOffset = config.sunriseOffset;
      }
      
      return option;
    };
    
    return {
      fajr: createPrayerOption('fajr', prayerConfig.fajr),
      dhuhr: createPrayerOption('dhuhr', prayerConfig.dhuhr),
      asr: createPrayerOption('asr', prayerConfig.asr),
      maghrib: createPrayerOption('maghrib', prayerConfig.maghrib),
      isha: createPrayerOption('isha', prayerConfig.isha)
    };
  }
  
  /**
   * Get default prayer configuration
   */
  private getDefaultPrayerConfig(): PrayerSettings {
    return {
      fajr: {
        type: 'fajr',
        showIqamah: true,
        iqamah: 20,
        offset: 0,
        isFixed: false,
        fixedTime: "05:30",
        calculateIqamahFromSunrise: false,
        sunriseOffset: -30
      },
      dhuhr: {
        type: 'dhuhr',
        showIqamah: true,
        iqamah: 15,
        offset: 0,
        isFixed: false,
        fixedTime: "13:30"
      },
      asr: {
        type: 'asr',
        showIqamah: true,
        iqamah: 15,
        offset: 0,
        isFixed: false,
        fixedTime: "16:30"
      },
      maghrib: {
        type: 'maghrib',
        showIqamah: true,
        iqamah: 10,
        offset: 0,
        isFixed: false,
        fixedTime: "19:30"
      },
      isha: {
        type: 'isha',
        showIqamah: true,
        iqamah: 15,
        offset: 0,
        isFixed: false,
        fixedTime: "21:00"
      }
    };
  }
  
  /**
   * Get prayer times for a specific date range
   */
  async getPrayerTimesForRange(startDate: Date, days: number = 7) {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);
      
      const prayerTimesList = await db.query.prayertimes.findMany({
        where: (fields, { and, between }) => and(
          between(fields.date, startDate, endDate)
        ),
        orderBy: [desc(prayertimes.date)],
      });
      
      return validatePrayerTimes(prayerTimesList);
    } catch (error) {
      console.error(`Error fetching prayer times for range:`, error);
      
      // Generate fallback data for the requested range
      const fallbackData = [];
      const currentDate = new Date(startDate);
      
      for (let i = 0; i < days; i++) {
        fallbackData.push({
          ...AppDataService.DEFAULT_PRAYER_TIMES,
          id: 0,
          date: new Date(currentDate)
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return fallbackData;
    }
  }
}

// Export singleton instance
export const appDataService = new AppDataService();