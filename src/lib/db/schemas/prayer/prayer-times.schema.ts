import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Constant for time format regex
const TIME_FORMAT = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

// Define prayer time type
export const prayerTimeSchema = z.object({
  time: z.string().regex(TIME_FORMAT),
});

export const prayertimes = sqliteTable("prayertimes", {
  id: integer("id").primaryKey(),
  date: integer("date", { mode: "timestamp" }).unique().notNull(),
  fajr: text("fajr").notNull(),
  sunrise: text("sunrise").notNull(),
  dhuhr: text("dhuhr").notNull(),
  asr: text("asr").notNull(),
  maghrib: text("maghrib").notNull(),
  isha: text("isha").notNull(),
});

export type PrayerTime = typeof prayertimes.$inferSelect;
export type InsertPrayerTime = typeof prayertimes.$inferInsert;

// Improved regex for time validation with better error message
const timeValidation = (field: string) => 
  z.string()
    .regex(TIME_FORMAT, `${field} must be in 24-hour format (HH:MM)`)
    .or(z.string().default("00:00"));

export const insertPrayerTime = createInsertSchema(prayertimes, {
  date: (item) => item.date.or(z.date().default(new Date())),
  fajr: (item) => timeValidation("Fajr"),
  sunrise: (item) => timeValidation("Sunrise"),
  dhuhr: (item) => timeValidation("Dhuhr"),
  asr: (item) => timeValidation("Asr"),
  maghrib: (item) => timeValidation("Maghrib"),
  isha: (item) => timeValidation("Isha"),
});

// Helper function to validate a single prayer time
export function isValidPrayerTime(time: string): boolean {
  return TIME_FORMAT.test(time);
}