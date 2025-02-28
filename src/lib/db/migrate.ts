import { drizzle } from "drizzle-orm/bun-sqlite"; // Importing Drizzle with Bun SQLite
import { migrate } from "drizzle-orm/better-sqlite3/migrator"; // Migration helper
import { Database } from "bun:sqlite"; // SQLite database via Bun

// Step 1: Initialize SQLite database file
// This will create "sqlite.db" in the project root if it doesn't already exist
const sqlite = new Database("sqlite.db");

// Step 2: Set up Drizzle ORM with the SQLite instance
const db = drizzle(sqlite);

// Step 3: Run migrations
// The migrations folder should contain your migration files in the correct format
migrate(db, { migrationsFolder: "./drizzle" }); // Ensure the path matches your project structure

// Step 4: Close the database connection after migration is complete
sqlite.close();

console.log("Migrations completed successfully!");
