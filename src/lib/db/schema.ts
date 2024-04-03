import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertPrayerTime = createInsertSchema(prayertimes, {
  date: (item) => item.date.or(z.date().default(new Date())),
  fajr: (item) =>
    item.fajr.regex(/^[0-9]{2}:[0-9]{2}$/).or(z.string().default("00:00")),
  sunrise: (item) =>
    item.sunrise.regex(/^[0-9]{2}:[0-9]{2}$/).or(z.string().default("00:00")),
  dhuhr: (item) =>
    item.dhuhr.regex(/^[0-9]{2}:[0-9]{2}$/).or(z.string().default("00:00")),
  asr: (item) =>
    item.asr.regex(/^[0-9]{2}:[0-9]{2}$/).or(z.string().default("00:00")),
  maghrib: (item) =>
    item.maghrib.regex(/^[0-9]{2}:[0-9]{2}$/).or(z.string().default("00:00")),
  isha: (item) =>
    item.isha.regex(/^[0-9]{2}:[0-9]{2}$/).or(z.string().default("00:00")),
});
