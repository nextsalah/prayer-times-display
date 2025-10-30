import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schemas";

// Use DATABASE_URL from environment, fallback to sqlite.db for local dev
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || 'sqlite.db';
const client = new Database(dbPath);
export const db = drizzle(client, { schema });