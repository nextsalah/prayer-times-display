import type { Config } from "drizzle-kit";

export default {
  driver: "better-sqlite",
  dbCredentials: {
    url: "sqlite.db",
  },
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
} satisfies Config;