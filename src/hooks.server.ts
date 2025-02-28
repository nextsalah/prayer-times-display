// hook.server.ts
import { db } from '$lib/db';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import type { ServerInit } from '@sveltejs/kit';

// This function will initialize the database
async function initializeDatabase() {
  try {
    console.log("🗃️ Initializing database...");
    
    // Run migrations using Drizzle's built-in migrator
    await migrate(db, { migrationsFolder: "./drizzle" });
    
    console.log("✅ Database initialization completed successfully");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    throw error;
  }
}

export const init: ServerInit = async () => {
  console.log("🚀 Server initialization started");
  
  // Initialize the database when the server starts
  await initializeDatabase();
  
  console.log("✨ Server initialization completed");
};