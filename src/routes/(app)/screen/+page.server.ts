import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db.server';
import { prayertimes } from '$lib/db/schemas/prayer/prayer-times.schema';
import { lt, desc } from 'drizzle-orm';
import { validatePrayerTimes } from '$lib/utils/dataValidation';
import { ThemeService, LanguageService } from '$lib/db';
import { Theme } from '$themes/logic/handler';
import { prayerConfigService } from '$lib/db/services/prayerconfig';
import type { ApiData, PrayerTimeDay, PrayerOptions } from '$themes/interfaces/api';
import type { Prayer } from '$lib/db/schemas/prayer/prayer-config.schema';

export const load = (async () => {
  // 1. Get prayer times
  const prayerTimesList = await db.query.prayertimes.findMany({
    where: lt(prayertimes.date, new Date()),
    orderBy: [desc(prayertimes.date)],
    limit: 3,
  });

  const validatedPrayerTimesList = validatePrayerTimes(prayerTimesList);
  const now = new Date();

  // Convert to PrayerTimeDay format
  const convertToPrayerTimeDay = (pt: typeof validatedPrayerTimesList[0]): PrayerTimeDay => ({
    ...pt,
    createdAt: now,
    updatedAt: now
  });

  const prayerTimes = {
    today: convertToPrayerTimeDay(validatedPrayerTimesList[0]),
    tomorrow: convertToPrayerTimeDay(validatedPrayerTimesList[1]),
    dayAfterTomorrow: convertToPrayerTimeDay(validatedPrayerTimesList[2])
  };

  // 2. Get theme settings
  const themeSettings = await ThemeService.get();
  const theme = await Theme.load(themeSettings.themeName);
  if (theme instanceof Error) {
    throw new Error('Failed to load theme');
  }

  // 3. Get language settings
  const language = await LanguageService.get();

  // 4. Get prayer configuration
  const prayerConfig = await prayerConfigService.getAll();

  // Convert prayer config to PrayerOptions format with proper typing
  const prayerOptions: PrayerOptions = {
    fajr: {
      ...prayerConfig.fajr,
      id: 1,
      name: language.fajr,
      createdAt: now,
      updatedAt: now
    },
    dhuhr: {
      ...prayerConfig.dhuhr,
      id: 1,
      name: language.dhuhr,
      createdAt: now,
      updatedAt: now
    },
    asr: {
      ...prayerConfig.asr,
      id: 1,
      name: language.asr,
      createdAt: now,
      updatedAt: now
    },
    maghrib: {
      ...prayerConfig.maghrib,
      id: 1,
      name: language.maghrib,
      createdAt: now,
      updatedAt: now
    },
    isha: {
      ...prayerConfig.isha,
      id: 1,
      name: language.isha,
      createdAt: now,
      updatedAt: now
    }
  };

  // 5. Construct API data for the theme
  const apiData: ApiData = {
    prayertimes: {
      today: prayerTimes.today,
      tomorrow: prayerTimes.tomorrow,
      afterTomorrow: prayerTimes.dayAfterTomorrow
    },
    custom_settings: JSON.parse(themeSettings.customSettings || '{}'),
    prayer_options: prayerOptions,
    settings: {
      id: 1,
      showQRCode: false,
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      createdAt: now,
      updatedAt: now
    },
    language: {
      ...language,
      id: 1
    }
  };

  return {
    prayerTimes,
    apiData,
    theme: theme.themeData,
    componentPath: themeSettings.themeName
  };
}) satisfies PageServerLoad;
