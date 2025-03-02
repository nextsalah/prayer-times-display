import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// 1. Language Settings Table
export const languageSettings = sqliteTable("language_settings", {
  id: integer("id").primaryKey().$default(() => 1),
  language_code: text("language_code").notNull().default("en"),
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

// 2. Time Settings Table
export const timeSettings = sqliteTable('time_settings', {
  id: integer('id').primaryKey().$default(() => 1),
  timezone: text('timezone').default('UTC').notNull(),
  timeFormat: text('time_format').default('24h').notNull(),
  showSeconds: integer('show_seconds', {mode:'boolean'}).default(true).notNull(),
  use24Hour: integer('use_24_hour', {mode:'boolean'}).default(true).notNull(),
  timeStyle: text('time_style').default('medium').notNull(),
});

// 3. Date Settings Table
export const dateSettings = sqliteTable('date_settings', {
  id: integer('id').primaryKey().$default(() => 1),
  dateFormat: text('date_format').default('DD/MM/YYYY').notNull(),
});

// =================== Zod Validation Schemas ===================

// 1. Language Settings Schema
export const LanguageSchema = z.object({
  language_code: z.string().default('sv'),
  fajr: z.string().min(2).max(20).trim(),
  sunrise: z.string().min(3).max(20).trim(),
  dhuhr: z.string().min(2).max(20).trim(),
  asr: z.string().min(2).max(20).trim(),
  maghrib: z.string().min(3).max(20).trim(),
  isha: z.string().min(2).max(20).trim(),
  prayer: z.string().min(3).max(20).trim(),
  iqamah: z.string().min(3).max(20).trim(),
  begins: z.string().min(3).max(20).trim(),
  next: z.string().min(2).max(20).trim(),
});

// 2. Time Settings Schema
export const TimeSettingsSchema = z.object({
  timezone: z.string().min(1).default('UTC'),
  timeFormat: z.enum(['12h', '24h']).default('24h'),
  showSeconds: z.boolean().default(true),
  use24Hour: z.boolean().default(true),
  timeStyle: z.enum(['short', 'medium', 'long']).default('medium'),
});

// 3. Date Settings Schema
export const DateSettingsSchema = z.object({
  dateFormat: z.enum([
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'YYYY-MM-DD',
    'DD MMM YYYY',
    'MMMM DD, YYYY'
  ]).default('DD/MM/YYYY'),
});

// Combined Localization Schema
export const LocalizationSchema = z.object({
  language: LanguageSchema,
  timeSettings: TimeSettingsSchema,
  dateSettings: DateSettingsSchema,
});

// =================== Types ===================

// Language types
export type LanguageSettings = typeof languageSettings.$inferSelect;
export type NewLanguageSettings = typeof languageSettings.$inferInsert;
export type LanguageSchemaType = z.infer<typeof LanguageSchema>;
// Time settings types
export type TimeSettings = typeof timeSettings.$inferSelect;
export type NewTimeSettings = typeof timeSettings.$inferInsert;
export type TimeSettingsSchemaType = z.infer<typeof TimeSettingsSchema>;

// Date settings types
export type DateSettings = typeof dateSettings.$inferSelect;
export type NewDateSettings = typeof dateSettings.$inferInsert;
export type DateSettingsSchemaType = z.infer<typeof DateSettingsSchema>;

// Combined localization type
export type LocalizationType = z.infer<typeof LocalizationSchema>;

// =================== Drizzle-Zod schemas ===================

// Language settings schemas
export const insertLanguageSettingsSchema = createInsertSchema(languageSettings);
export const selectLanguageSettingsSchema = createSelectSchema(languageSettings);

// Time settings schemas
export const insertTimeSettingsSchema = createInsertSchema(timeSettings);
export const selectTimeSettingsSchema = createSelectSchema(timeSettings);

// Date settings schemas
export const insertDateSettingsSchema = createInsertSchema(dateSettings);
export const selectDateSettingsSchema = createSelectSchema(dateSettings);