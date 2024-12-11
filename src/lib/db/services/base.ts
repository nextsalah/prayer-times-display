import { eq } from 'drizzle-orm';
import { db } from '../db.server';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';

export class SingletonDB<T extends { id: number }> {
    constructor(
        private table: SQLiteTable, // The table object
    ) {}

    async get(): Promise<T> {
        const result = await db
            .select()
            .from(this.table)
            .where(eq((this.table as any).id, 1)) // Cast to access 'id' safely
            .limit(1);

        return (result[0] as T) ?? await this.createDefault();
    }

    private async createDefault(): Promise<T> {
        const defaultData = {} as T;
        await db.insert(this.table).values(defaultData);
        return defaultData;
    }

    async update(updates: Partial<Omit<T, 'id'>>): Promise<T> {
        await db
            .update(this.table)
            .set(updates)
            .where(eq((this.table as any).id, 1)); // Cast to access 'id' safely

        return this.get();
    }
}