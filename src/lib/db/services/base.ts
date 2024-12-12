import { eq } from 'drizzle-orm';
import { db } from '../db.server';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';

export class SingletonDB<T extends { id: number }> {
    constructor(
        private table: SQLiteTable
    ) {}

    async get(): Promise<T> {
        const result = await db
            .select()
            .from(this.table)
            .where(eq((this.table as any).id, 1))
            .limit(1);

        if (!result.length) {
            return this.createDefault();
        }

        return result[0] as T;
    }

    private async createDefault(): Promise<T> {
        // Insert with empty object - will use schema defaults
        const result = await db
            .insert(this.table)
            .values({})
            .returning();

        return result[0] as T;
    }

    async update(updates: Partial<Omit<T, 'id'>>): Promise<T> {
        await db
            .update(this.table)
            .set(updates)
            .where(eq((this.table as any).id, 1));

        return this.get();
    }
}