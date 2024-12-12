import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from 'zod';

// Define a Zod schema for validating the fixed time
const fixedTimeSchema = z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Invalid fixed time format');

// Custom validation function
const validateFixedTime = (value: string) => {
  const result = fixedTimeSchema.safeParse(value);
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }
  return value;
};

export const prayerOptions = sqliteTable("prayer_options", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  showIqamah: integer("show_iqamah", { mode: 'boolean' }).notNull().default(true),
  iqamah: integer("iqamah").notNull().default(0),
  iqamahAfterPrayer: integer("iqamah_after_prayer", { mode: 'boolean' }).notNull().default(true),
  offset: integer("offset").notNull().default(0),
  isFixed: integer("is_fixed", { mode: 'boolean' }).notNull().default(false),
  fixedTime: text("fixed_time").notNull(),
});

export type PrayerOptions = typeof prayerOptions.$inferSelect;
export const availablePrayerOptions = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export const insertPrayerOptionSchema = createInsertSchema(prayerOptions, {
  name: z.enum(availablePrayerOptions),
  showIqamah: z.boolean().default(true),
  iqamah: z.number().nonnegative("Iqamah cannot be negative").default(0),
  iqamahAfterPrayer: z.boolean().default(true),
  offset: z.number().nonnegative("Offset cannot be negative").default(0),
  isFixed: z.boolean().default(false),
  fixedTime: z.string().transform(validateFixedTime),
});