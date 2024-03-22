import type { Config } from "drizzle-kit";

export default {
  driver: "better-sqlite",
  dbCredentials: {
    url: "sqlite.db",
  },
  schema: "./db/schema.ts",
  out: "./drizzle",
} satisfies Config;