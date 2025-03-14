// base.ts
import { eq } from 'drizzle-orm';
import { db } from '../db.server';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';

/**
 * Singleton database pattern for handling tables with a single record
 * T should be the inferred type from your Drizzle schema
 */
export class SingletonDB<T extends object> {
    constructor(
        private table: SQLiteTable
    ) {}

    /**
     * Get the singleton record with ID 1, omitting the ID from the result
     */
    async get(): Promise<Omit<T, 'id'>> {
        const result = await db
            .select()
            .from(this.table)
            .where(eq((this.table as any).id, 1))
            .limit(1);

        if (!result.length) {
            return this.createDefault();
        }

        // Destructure to remove id from the result
        const { id, ...data } = result[0];
        return data as Omit<T, 'id'>;
    }

    /**
     * Create a default record if none exists
     * Uses table defaults from schema for initialization
     */
    private async createDefault(): Promise<Omit<T, 'id'>> {
        try {
            // Insert a record with ID 1 explicitly
            const result = await db
                .insert(this.table)
                .values({ id: 1 } as any)
                .returning();

            if (result && result.length > 0) {
                // Remove id from result
                const { id, ...data } = result[0];
                return data as Omit<T, 'id'>;
            }

            // Fallback to another attempt at getting the record
            return this.get();
        } catch (error) {
            console.error('Error creating default singleton record:', error);
            // If insert fails (e.g., due to conflict), try getting again
            const result = await db
                .select()
                .from(this.table)
                .where(eq((this.table as any).id, 1))
                .limit(1);

            if (result && result.length > 0) {
                const { id, ...data } = result[0];
                return data as Omit<T, 'id'>;
            }

            // If all attempts fail, return an empty object
            return {} as Omit<T, 'id'>;
        }
    }

    /**
     * Update the singleton record with partial data
     * Automatically sets updatedAt if it exists in the schema
     */
    async update(updates: Partial<Omit<T, 'id'>>): Promise<Omit<T, 'id'>> {
        // Add updated timestamp if the field exists in schema
        const updatesWithTimestamp = { ...updates };
        
        // Check if updatedAt exists in the schema by checking table columns
        const tableColumns = Object.keys(this.table);
        if (tableColumns.includes('updated_at') || tableColumns.includes('updatedAt')) {
            (updatesWithTimestamp as any).updatedAt = new Date();
        }

        await db
            .update(this.table)
            .set(updatesWithTimestamp)
            .where(eq((this.table as any).id, 1));

        return this.get();
    }

    /**
     * Reset to provided default values
     */
    async reset(defaults: Partial<Omit<T, 'id'>> = {}): Promise<Omit<T, 'id'>> {
        return this.update(defaults);
    }
}