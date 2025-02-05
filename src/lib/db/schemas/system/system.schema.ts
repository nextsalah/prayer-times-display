// $lib/db/schema/system.ts
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Drizzle schema
export const systemSettings = sqliteTable('system_settings', {
  id: integer('id').primaryKey(),
  timezone: text('timezone').default('UTC').notNull(),
  timeFormat: text('time_format').default('24h').notNull(),
  dateFormat: text('date_format').default('DD/MM/YYYY').notNull(),
  showSeconds:  integer('show_seconds', {mode:'boolean'}).default(true).notNull(),
  showMilliseconds: integer('show_milliseconds', {mode:'boolean'}).default(false).notNull(),
  use24Hour: integer('use_24_hour', {mode:'boolean'}).default(true).notNull(),
  timeStyle: text('time_style').default('medium').notNull(),
});

// Zod schema for validation
export const SystemSettingsSchema = z.object({
  id: z.number().optional(),
  timezone: z.string().min(1).default('UTC'),
  timeFormat: z.enum(['12h', '24h']).default('24h'),
  dateFormat: z.enum([
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'YYYY-MM-DD',
    'DD MMM YYYY',
    'MMMM DD, YYYY'
  ]).default('DD/MM/YYYY'),
  showSeconds: z.boolean().default(true),
  showMilliseconds: z.boolean().default(false),
  use24Hour: z.boolean().default(true),
  timeStyle: z.enum(['short', 'medium', 'long']).default('medium')
});

// Types
export type SystemSettings = typeof systemSettings.$inferSelect;
export type NewSystemSettings = typeof systemSettings.$inferInsert;
export type SystemSettingsSchemaType = z.infer<typeof SystemSettingsSchema>;

// Drizzle-Zod schemas
export const insertSystemSettingsSchema = createInsertSchema(systemSettings);
export const selectSystemSettingsSchema = createSelectSchema(systemSettings);