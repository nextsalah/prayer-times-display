import { 
  languageSettings, 
  timeSettings,
  dateSettings, 
  type LanguageSchemaType, 
  type TimeSettingsSchemaType,
  type DateSettingsSchemaType,
  type LocalizationType
} from "../schemas";
import { SingletonDB } from "./base";

/**
 * Service for language settings management
 */
export class LanguageService extends SingletonDB<LanguageSchemaType> {
  constructor() {
    super(languageSettings);
  }
}

/**
 * Service for time format settings
 */
export class TimeSettingsService extends SingletonDB<TimeSettingsSchemaType> {
  constructor() {
    super(timeSettings);
  }

  /**
   * Update time display settings
   */
  async updateTimeDisplay(settings: {
    showSeconds?: boolean;
    use24Hour?: boolean;
    timeStyle?: 'short' | 'medium' | 'long';
  }) {
    return this.update(settings);
  }

  /**
   * Update timezone settings
   */
  async updateTimezone(timezone: string) {
    return this.update({ timezone });
  }
}

/**
 * Service for date format settings
 */
export class DateSettingsService extends SingletonDB<DateSettingsSchemaType> {
  constructor() {
    super(dateSettings);
  }

  /**
   * Update date format settings
   */
  async updateDateFormat(format: DateSettingsSchemaType['dateFormat']) {
    return this.update({ dateFormat: format });
  }
}

/**
 * Combined localization service that manages language, time, and date settings
 */
export class LocalizationService {
  private languageService: LanguageService;
  private timeSettingsService: TimeSettingsService;
  private dateSettingsService: DateSettingsService;

  constructor() {
    this.languageService = new LanguageService();
    this.timeSettingsService = new TimeSettingsService();
    this.dateSettingsService = new DateSettingsService();
  }

  /**
   * Get complete localization settings
   */
  async getLocalization(): Promise<LocalizationType> {
    const [language, timeSettings, dateSettings] = await Promise.all([
      this.languageService.get(),
      this.timeSettingsService.get(),
      this.dateSettingsService.get()
    ]);

    return {
      language: language as LanguageSchemaType,
      timeSettings: timeSettings as TimeSettingsSchemaType,
      dateSettings: dateSettings as DateSettingsSchemaType
    };
  }

  /**
   * Update language settings
   */
  async updateLanguage(updates: Partial<LanguageSchemaType>) {
    return this.languageService.update(updates);
  }

  /**
   * Update time settings
   */
  async updateTimeSettings(updates: Partial<TimeSettingsSchemaType>) {
    return this.timeSettingsService.update(updates);
  }

  /**
   * Update date settings
   */
  async updateDateSettings(updates: Partial<DateSettingsSchemaType>) {
    return this.dateSettingsService.update(updates);
  }

  /**
   * Save complete localization settings
   */
  async saveLocalization(localization: Partial<LocalizationType>) {
    const updates = await Promise.all([
      localization.language && this.languageService.update(localization.language),
      localization.timeSettings && this.timeSettingsService.update(localization.timeSettings),
      localization.dateSettings && this.dateSettingsService.update(localization.dateSettings)
    ]);

    return this.getLocalization();
  }

  /**
   * Get language-specific settings
   */
  get language() {
    return this.languageService;
  }

  /**
   * Get time-specific settings
   */
  get time() {
    return this.timeSettingsService;
  }

  /**
   * Get date-specific settings
   */
  get date() {
    return this.dateSettingsService;
  }
}

// Export singleton instances
export const languageService = new LanguageService();
export const timeSettingsService = new TimeSettingsService();
export const dateSettingsService = new DateSettingsService();
export const localizationService = new LocalizationService();