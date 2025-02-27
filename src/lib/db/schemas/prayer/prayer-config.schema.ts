import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { z } from 'zod';

export const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type Prayer = typeof PRAYERS[number];

// Base settings schema and type
const baseSettingsSchema = z.object({
  showIqamah: z.boolean(),
  iqamah: z.number().int().min(0).max(60),
  iqamahAfterPrayer: z.boolean(),
  offset: z.number().int().min(-60).max(60),
  isFixed: z.boolean(),
  fixedTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:mm)')
});

type BaseSettings = z.infer<typeof baseSettingsSchema>;

// Fajr specific schema and type
const fajrSpecificSchema = z.object({
  type: z.literal('fajr'),
  calculateIqamahFromSunrise: z.boolean(),
  sunriseOffset: z.number().int().min(-120).max(0)
});

// Schemas for each prayer type
const fajrSchema = baseSettingsSchema.merge(fajrSpecificSchema);
const regularPrayerSchema = baseSettingsSchema.extend({
  type: z.enum(['dhuhr', 'asr', 'maghrib', 'isha'])
});

// Combined prayer schema for validation
export const prayerSettingsSchema = z.discriminatedUnion('type', [
  fajrSchema,
  regularPrayerSchema
]);

// Types derived from schemas
type FajrSettings = z.infer<typeof fajrSchema>;
type RegularPrayerSettings = z.infer<typeof regularPrayerSchema>;

// Improved settings type
export type PrayerSettings = {
  [K in Prayer]: K extends 'fajr' ? FajrSettings : RegularPrayerSettings;
};

// Helper type to get settings type for a specific prayer
export type SettingsForPrayer<P extends Prayer> = PrayerSettings[P];

// Factory function for default settings
function createDefaultSettings(): PrayerSettings {
  return {
    fajr: {
      type: 'fajr',
      showIqamah: true,
      iqamah: 20,
      iqamahAfterPrayer: true,
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
      iqamahAfterPrayer: true,
      offset: 0,
      isFixed: false,
      fixedTime: "13:30"
    },
    asr: {
      type: 'asr',
      showIqamah: true,
      iqamah: 15,
      iqamahAfterPrayer: true,
      offset: 0,
      isFixed: false,
      fixedTime: "16:30"
    },
    maghrib: {
      type: 'maghrib',
      showIqamah: true,
      iqamah: 10,
      iqamahAfterPrayer: true,
      offset: 0,
      isFixed: false,
      fixedTime: "19:30"
    },
    isha: {
      type: 'isha',
      showIqamah: true,
      iqamah: 15,
      iqamahAfterPrayer: true,
      offset: 0,
      isFixed: false,
      fixedTime: "21:00"
    }
  };
}

// Database type
export type DbPrayerConfig = {
  id: number;
  settings: string;
};

const DEFAULT_CONFIG = {
  settings: createDefaultSettings()
};

export const prayerConfig = sqliteTable("prayer_config", {
  id: integer("id").primaryKey().$default(() => 1),
  settings: text("settings").notNull().$default(() => JSON.stringify(DEFAULT_CONFIG.settings))
});

// Validation helper for a specific prayer type
export function validatePrayerSettings<P extends Prayer>(
  prayer: P, 
  settings: unknown
): SettingsForPrayer<P> {
  // Add type field if not present
  const settingsWithType = {
    ...settings as object,
    type: prayer
  };
  
  return prayerSettingsSchema.parse(settingsWithType) as SettingsForPrayer<P>;
}