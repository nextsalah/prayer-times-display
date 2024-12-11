import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schemas";

const client = new Database("sqlite.db");
export const db = drizzle(client, { schema });