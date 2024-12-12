// src/lib/db/services/PrayerOptionService.ts
import { db } from '../db.server';
import { eq } from 'drizzle-orm';
import { prayerOptions, availablePrayerOptions, insertPrayerOptionSchema } from '../schemas';
import type { PrayerOptions } from '../schemas';

export const PrayerOptionDB = {
  async getAllPrayerOptions(): Promise<PrayerOptions[]> {
    return await db.select().from(prayerOptions).execute();
  },

  async getPrayerOptionByName(name: typeof availablePrayerOptions[number]): Promise<PrayerOptions | null> {
    const result = await db
      .select()
      .from(prayerOptions)
      .where(eq(prayerOptions.name, name))
      .limit(1)
      .execute();

    return result.length > 0 ? result[0] : null;
  },

  async createPrayerOption(data: Partial<Omit<PrayerOptions, 'id'>>): Promise<PrayerOptions> {
    const validatedData = await insertPrayerOptionSchema.parseAsync(data);
    const newOption = await db.insert(prayerOptions).values(validatedData).returning().get();
    return newOption;
  },

  async updatePrayerOption(id: number, updates: Partial<Omit<PrayerOptions, 'id'>>): Promise<PrayerOptions> {
    await db
      .update(prayerOptions)
      .set(updates)
      .where(eq(prayerOptions.id, id))
      .execute();

    return (await this.getPrayerOptionByName(updates.name as typeof availablePrayerOptions[number])) as PrayerOptions;
  },

  async deletePrayerOption(id: number): Promise<void> {
    await db.delete(prayerOptions).where(eq(prayerOptions.id, id)).execute();
  },
};