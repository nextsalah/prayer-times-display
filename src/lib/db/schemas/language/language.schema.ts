import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const languageSettings = sqliteTable("language_settings", {
  id: integer("id").primaryKey().$default(() => 1),
  fajr: text("fajr").notNull().default("Fajr"),
  sunrise: text("sunrise").notNull().default("Sunrise"),
  dhuhr: text("dhuhr").notNull().default("Dhuhr"),
  asr: text("asr").notNull().default("Asr"),
  maghrib: text("maghrib").notNull().default("Maghrib"),
  isha: text("isha").notNull().default("Isha"),
  prayer: text("prayer").notNull().default("Prayer"),
  iqamah: text("iqamah").notNull().default("Iqamah"),
  begins: text("begins").notNull().default("Begins"),
  next: text("next").notNull().default("Next"),
});

export type LanguageSettings = typeof languageSettings.$inferSelect;