import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { z } from 'zod';

export const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type Prayer = typeof PRAYERS[number];

// Base settings type
type BaseSettings = {
    showIqamah: boolean;
    iqamah: number;
    iqamahAfterPrayer: boolean;
    offset: number;
    isFixed: boolean;
    fixedTime: string;
};

// Fajr specific settings
type FajrSpecific = {
    calculateIqamahFromSunrise: boolean;
    sunriseOffset: number;
};

// Settings type for each prayer
export type PrayerSettings = {
    fajr: BaseSettings & FajrSpecific;
    dhuhr: BaseSettings;
    asr: BaseSettings;
    maghrib: BaseSettings;
    isha: BaseSettings;
};

// Helper type to get settings type for a specific prayer
export type SettingsForPrayer<P extends Prayer> = PrayerSettings[P];

// Validation schema
export const prayerSettingsSchema = z.object({
    showIqamah: z.boolean(),
    iqamah: z.number().int().min(0).max(60),
    iqamahAfterPrayer: z.boolean(),
    offset: z.number().int().min(-60).max(60),
    isFixed: z.boolean(),
    fixedTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:mm)'),
    calculateIqamahFromSunrise: z.boolean().optional(),
    sunriseOffset: z.number().int().min(-120).max(0).optional()
});

// Database type
export type DbPrayerConfig = {
    id: number;
    settings: string;
};

const DEFAULT_CONFIG: { settings: PrayerSettings } = {
    settings: {
        fajr: {
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
            showIqamah: true,
            iqamah: 15,
            iqamahAfterPrayer: true,
            offset: 0,
            isFixed: false,
            fixedTime: "13:30"
        },
        asr: {
            showIqamah: true,
            iqamah: 15,
            iqamahAfterPrayer: true,
            offset: 0,
            isFixed: false,
            fixedTime: "16:30"
        },
        maghrib: {
            showIqamah: true,
            iqamah: 10,
            iqamahAfterPrayer: true,
            offset: 0,
            isFixed: false,
            fixedTime: "19:30"
        },
        isha: {
            showIqamah: true,
            iqamah: 15,
            iqamahAfterPrayer: true,
            offset: 0,
            isFixed: false,
            fixedTime: "21:00"
        }
    }
};

export const prayerConfig = sqliteTable("prayer_config", {
    id: integer("id").primaryKey().$default(() => 1),
    settings: text("settings").notNull().$default(() => JSON.stringify(DEFAULT_CONFIG.settings))
});