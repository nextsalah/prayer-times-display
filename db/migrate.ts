import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { Database } from 'bun:sqlite';

const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: "drizzle" });

sqlite.close()


