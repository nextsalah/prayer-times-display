import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const prayertime_item = sqliteTable('prayertime_item', {
    id: integer('id').primaryKey(),
    date: integer('date', { mode: 'timestamp'} ).unique().notNull(),
    fajr: text('fajr').notNull(),
    dhuhr: text('dhuhr').notNull(),
    asr: text('asr').notNull(),
    maghrib: text('maghrib').notNull(),
    isha: text('isha').notNull(),
})


export type PrayertimeItem = typeof prayertime_item.$inferSelect;
export type PrayertimeItemInsert = typeof prayertime_item.$inferInsert;