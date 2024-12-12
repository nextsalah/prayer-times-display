import { eq } from 'drizzle-orm';
import { db } from '../db.server';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';

export class SingletonDB<T extends object> {
    constructor(
        private table: SQLiteTable
    ) {}

    async get(): Promise<Omit<T, 'id'>> {
        const result = await db
            .select()
            .from(this.table)
            .where(eq((this.table as any).id, 1))
            .limit(1);

        if (!result.length) {
            return this.createDefault();
        }

        const { id, ...data } = result[0];
        return data as Omit<T, 'id'>;
    }

    private async createDefault(): Promise<Omit<T, 'id'>> {
        const result = await db
            .insert(this.table)
            .values({})
            .returning();

        const { id, ...data } = result[0];
        return data as Omit<T, 'id'>;
    }

    async update(updates: Partial<Omit<T, 'id'>>): Promise<Omit<T, 'id'>> {
        await db
            .update(this.table)
            .set(updates)
            .where(eq((this.table as any).id, 1));

        return this.get();
    }
}