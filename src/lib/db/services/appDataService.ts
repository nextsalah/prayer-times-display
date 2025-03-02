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
import { Theme } from '$lib/themes/logic/handler';
import { prayerConfigService } from '$lib/db/services/prayerconfig';
import type { SettingsFromFields } from '$lib/themes/logic/theme-settings-manager';
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

export interface ApiData {
  prayertimes: Prayertimes;
  custom_settings: unknown;
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
export interface AppDataResult {
  prayerTimes: {
    today: PrayerTime;
    tomorrow: PrayerTime;
    dayAfterTomorrow: PrayerTime;
  };
  apiData: ApiData;
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
      const apiData = {
        prayertimes: {
          today: prayerTimes.today,
          tomorrow: prayerTimes.tomorrow,
          afterTomorrow: prayerTimes.dayAfterTomorrow
        },
        custom_settings: customSettings,
        prayer_options: prayerOptions,
        settings: appSettings,
        language: languageWithId
      } as ApiData;
      
      return {
        prayerTimes,
        apiData,
        theme: theme.themeData,
        componentPath: themeSettings.themeName
      } as AppDataResult;
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const isoDate = `${year}-${month}-${day}`;
    
    // Format 2: MM-DD (month-day only)
    const monthDayFormat = `${month}-${day}`;
    
    return [isoDate, monthDayFormat];
  }
  
  /**
   * Get prayer times with robust error handling and multiple date formats
   */
  /**
   * Get prayer times with robust error handling and multiple date formats
   */
    private async getPrayerTimes() {
      try {
        // Use local system time instead of UTC
        const now = new Date();
        
        // Log the date we're fetching for debugging
        console.log(`Getting prayer times for local date: ${now.toISOString()}`);
        
        // Format the date in ISO format (YYYY-MM-DD)
        const isoDate = now.toISOString().split('T')[0];
        console.log(`Using ISO date format: ${isoDate}`);
        
        // Try to get prayer times for today with ISO date format
        let todayPrayerTimes = await this.tryGetPrayerTimesByExactDate(isoDate);
        
        // If we couldn't find today's prayer times, try to get the most recent one
        if (!todayPrayerTimes) {
          console.log(`No prayer times found for exact date ${isoDate}, trying to get most recent`);
          const recentPrayers = await db.query.prayertimes.findMany({
          where: (fields, { lte }) => lte(fields.date, now),
          orderBy: [desc(prayertimes.date)],
          limit: 1,
        });
        
        if (recentPrayers.length > 0) {
          todayPrayerTimes = recentPrayers[0];
        }
      }
      
      // If we still couldn't find prayer times, try month-day format as fallback
      if (!todayPrayerTimes) {
        console.log('No recent prayer times found, trying month-day format');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const monthDayFormat = `${month}-${day}`;
        
        todayPrayerTimes = await this.tryGetPrayerTimesByPartialDate(monthDayFormat);
      }
      
      // If we couldn't find today's prayer times at all, use default
      if (!todayPrayerTimes) {
        console.warn('No prayer times found for today, using default');
        todayPrayerTimes = {
          ...AppDataService.DEFAULT_PRAYER_TIMES,
          id: 0,
          date: now
        };
      }
      
      // Now get tomorrow and day after tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowIsoDate = tomorrow.toISOString().split('T')[0];
      
      let tomorrowPrayerTimes = await this.tryGetPrayerTimesByExactDate(tomorrowIsoDate);
      if (!tomorrowPrayerTimes) {
        // Try with month-day for tomorrow
        const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowMonthDay = `${tomorrowMonth}-${tomorrowDay}`;
        
        tomorrowPrayerTimes = await this.tryGetPrayerTimesByPartialDate(tomorrowMonthDay);
      }
      if (!tomorrowPrayerTimes) {
        tomorrowPrayerTimes = {
          ...AppDataService.DEFAULT_PRAYER_TIMES,
          id: 0,
          date: tomorrow
        };
      }
      
      const dayAfter = new Date(now);
      dayAfter.setDate(dayAfter.getDate() + 2);
      const dayAfterIsoDate = dayAfter.toISOString().split('T')[0];
      
      let dayAfterPrayerTimes = await this.tryGetPrayerTimesByExactDate(dayAfterIsoDate);
      if (!dayAfterPrayerTimes) {
        // Try with month-day for day after tomorrow
        const dayAfterMonth = String(dayAfter.getMonth() + 1).padStart(2, '0');
        const dayAfterDay = String(dayAfter.getDate()).padStart(2, '0');
        const dayAfterMonthDay = `${dayAfterMonth}-${dayAfterDay}`;
        
        dayAfterPrayerTimes = await this.tryGetPrayerTimesByPartialDate(dayAfterMonthDay);
      }
      if (!dayAfterPrayerTimes) {
        dayAfterPrayerTimes = {
          ...AppDataService.DEFAULT_PRAYER_TIMES,
          id: 0,
          date: dayAfter
        };
      }
      
      return {
        today: todayPrayerTimes,
        tomorrow: tomorrowPrayerTimes,
        dayAfterTomorrow: dayAfterPrayerTimes
      };
    } catch (error) {
      console.error('Error getting prayer times:', error);
      return this.getDefaultPrayerTimes();
    }
  }
  
  /**
   * Try to get prayer times for an exact date match - using the working approach from our tests
   */
  private async tryGetPrayerTimesByExactDate(dateStr: string): Promise<PrayerTime | null> {
    try {
      // Use the direct comparison approach that worked in testing
      const result = await db.query.prayertimes.findMany({
        where: (fields, { eq }) => eq(fields.date, new Date(dateStr)),
        limit: 1,
      });
      
      if (result.length > 0) {
        return result[0];
      }
      
      // If direct comparison fails, try DATE function as backup
      const dateResult = await db.query.prayertimes.findMany({
        where: (fields, { sql }) => sql`DATE(${fields.date}) = DATE(${dateStr})`,
        limit: 1,
      });
      
      return dateResult.length > 0 ? dateResult[0] : null;
    } catch (error) {
      console.error(`Error querying with exact date ${dateStr}:`, error);
      return null;
    }
  }
    
  /**
   * Try to get prayer times by partial date (month-day)
   */
  private async tryGetPrayerTimesByPartialDate(datePattern: string): Promise<PrayerTime | null> {
    try {
      // Convert date to string and search for month-day pattern more reliably
      const result = await db.query.prayertimes.findMany({
        where: (fields, { sql }) => 
          sql`STRFTIME('%m-%d', ${fields.date}) = ${datePattern}`,
        limit: 1,
      });
      
      if (result.length === 0) {
        // Fallback to LIKE query if STRFTIME is not supported by the database
        const fallbackResult = await db.query.prayertimes.findMany({
          where: (fields, { sql }) => 
            sql`CAST(${fields.date} AS TEXT) LIKE ${'%' + datePattern}`,
          limit: 1,
        });
        
        return fallbackResult.length > 0 ? fallbackResult[0] : null;
      }
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`Error querying with partial date ${datePattern}:`, error);
      return null;
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