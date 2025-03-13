import { 
  localizationService,
  themeService,
  prayerConfigService,
  prayerTimesService
} from '$lib/db';
import { Theme } from '$lib/themes/logic/handler';
import { loadThemeComponent } from '$lib/themes/logic/theme-loader';
import { mergeWithDefaults } from '$lib/themes/logic/theme-settings-manager';
import {type SettingsForPrayer, type DateSettingsSchemaType, type LanguageSchemaType, type Prayer, type PrayerSettings, type PrayerTime, type TimeSettingsSchemaType, type ThemeSettings } from '../schemas';

export type PrayerOptionType<P extends Prayer = Prayer> = SettingsForPrayer<P> & {
  name: string;
  type: P;
}
// Record of prayer options keyed by prayer name
export interface PrayerOptions {
  fajr: PrayerOptionType<'fajr'>;
  dhuhr: PrayerOptionType<'dhuhr'>;
  asr: PrayerOptionType<'asr'>;
  maghrib: PrayerOptionType<'maghrib'>;
  isha: PrayerOptionType<'isha'>;
}

export interface AppData<T> {
  prayerTimes: {
    today: PrayerTime,
    tomorrow: PrayerTime,
    afterTomorrow: PrayerTime
  },
  prayer_options: PrayerOptions,
  localization: {
    language: LanguageSchemaType,
    timeSettings: TimeSettingsSchemaType,
    dateSettings: DateSettingsSchemaType,
  },
  custom_settings: T,
  themeSettings: Omit<ThemeSettings, 'id'>
}
export class AppDataService {
  async getAppData<T= any>() : Promise< AppData<T> > {
    try {
      // Get data
      const [themeSettings, localization, prayerConfig, prayerTimes,] = await Promise.all([
        themeService.getAllThemeSettings(),
        localizationService.getLocalization(),
        prayerConfigService.getAll(),
        prayerTimesService.getPrayerTimes()
      ]);
      
      const activeTheme = await Theme.load(themeSettings.themeName);
      if (!activeTheme || activeTheme instanceof Error) {
        throw new Error(`Failed to load theme component '${themeSettings.themeName}'`);
      }
      
      const custom_settings = await themeService.getCustomSettingsObject();
      const userSettings = mergeWithDefaults(custom_settings, activeTheme.customization);

      return {
        prayerTimes: {
          today: prayerTimes.today,
          tomorrow: prayerTimes.tomorrow,
          afterTomorrow: prayerTimes.dayAfterTomorrow
        },
        prayer_options: this.formatPrayerOptions(prayerConfig, localization.language),
        localization: {
          language: localization.language,
          timeSettings: localization.timeSettings,
          dateSettings: localization.dateSettings
        },
        custom_settings: userSettings as T,
        themeSettings
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(errorMessage);
    }
  }
  
  private formatPrayerOptions(prayerConfig: PrayerSettings, language: LanguageSchemaType): PrayerOptions {
    const createOption = <P extends Prayer>(prayer: P, config: PrayerSettings[P]): PrayerOptionType<P> => ({
      name: language[prayer] || prayer.charAt(0).toUpperCase() + prayer.slice(1),
      showIqamah: config.showIqamah,
      iqamah: config.iqamah,
      offset: config.offset,
      isFixed: config.isFixed,
      fixedTime: config.fixedTime,
      type: prayer,
      ...(prayer === 'fajr' && {
        calculateIqamahFromSunrise: 'calculateIqamahFromSunrise' in config ? 
          config.calculateIqamahFromSunrise : false,
        sunriseOffset: 'sunriseOffset' in config ? config.sunriseOffset : 0
      })
    } as PrayerOptionType<P>);
    
    return {
      fajr: createOption('fajr', prayerConfig.fajr),
      dhuhr: createOption('dhuhr', prayerConfig.dhuhr),
      asr: createOption('asr', prayerConfig.asr),
      maghrib: createOption('maghrib', prayerConfig.maghrib),
      isha: createOption('isha', prayerConfig.isha)
    };
  }
}

export const appDataService = new AppDataService();