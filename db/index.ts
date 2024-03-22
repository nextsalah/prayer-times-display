import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { prayertime_item } from './schema';
import type { PrayertimeItemInsert } from './schema';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

const result = await db.select().from(prayertime_item);

// add example data
const example_prayertime_item : PrayertimeItemInsert = {
    date:  new Date(),
    fajr: '05:00',
    dhuhr: '12:00',
    asr: '15:00',
    maghrib: '18:00',
    isha: '20:00',
};
await db.insert(prayertime_item).values(example_prayertime_item);


 
