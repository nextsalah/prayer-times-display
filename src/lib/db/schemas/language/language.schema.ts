import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { z } from "zod";

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

const TEXT_REGEX = /^[a-zA-Z0-9\s.,!?'-]+$/;
export const LanguageSchema = z.object({
  id: z.number().optional(),
  fajr: z.string()
    .min(2, "Fajr name must be at least 2 characters")
    .max(20, "Fajr name cannot exceed 20 characters")
    .regex(TEXT_REGEX, "Please use only letters, spaces, and basic punctuation")
    .trim(),
  sunrise: z.string()
    .min(3, "Sunrise name must be at least 3 characters")
    .max(20, "Sunrise name cannot exceed 20 characters")
    .regex(TEXT_REGEX, "Please use only letters, spaces, and basic punctuation")
    .trim(),
  dhuhr: z.string()
    .min(2, "Dhuhr name must be at least 2 characters")
    .max(20, "Dhuhr name cannot exceed 20 characters")
    .regex(TEXT_REGEX, "Please use only letters, spaces, and basic punctuation")
    .trim(),
  asr: z.string()
    .min(2, "Asr name must be at least 2 characters")
    .max(20, "Asr name cannot exceed 20 characters")
    .regex(TEXT_REGEX, "Please use only letters, spaces, and basic punctuation")
    .trim(),
  maghrib: z.string()
    .min(3, "Maghrib name must be at least 3 characters")
    .max(20, "Maghrib name cannot exceed 20 characters")
    .regex(TEXT_REGEX, "Please use only letters, spaces, and basic punctuation")
    .trim(),
  isha: z.string()
    .min(2, "Isha name must be at least 2 characters")
    .max(20, "Isha name cannot exceed 20 characters")
    .regex(TEXT_REGEX, "Please use only letters, spaces, and basic punctuation")
    .trim(),
  prayer: z.string()
    .min(3, "Prayer label must be at least 3 characters")
    .max(20, "Prayer label cannot exceed 20 characters")
    .regex(TEXT_REGEX, "Please use only letters, spaces, and basic punctuation")
    .trim(),
  iqamah: z.string()
    .min(3, "Iqamah label must be at least 3 characters")
    .max(20, "Iqamah label cannot exceed 20 characters")
    .regex(TEXT_REGEX, "Please use only letters, spaces, and basic punctuation")
    .trim(),
  begins: z.string()
    .min(3, "Begins label must be at least 3 characters")
    .max(20, "Begins label cannot exceed 20 characters")
    .regex(TEXT_REGEX, "Please use only letters, spaces, and basic punctuation")
    .trim(),
  next: z.string()
    .min(2, "Next label must be at least 2 characters")
    .max(20, "Next label cannot exceed 20 characters")
    .regex(TEXT_REGEX, "Please use only letters, spaces, and basic punctuation")
    .trim(),
});

// Create a type-safe validator
export type LanguageSchemaType = z.infer<typeof LanguageSchema>;