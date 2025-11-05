// Re-export getDb from @repo/db but with this app's extended schema
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import type { AnyD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb(database: AnyD1Database) {
  try {
    return drizzleD1(database, { schema, logger: true });
  } catch (err) {
    console.error("Failed to get database:", err);
    throw new Error("Failed to get database");
  }
}

export type Database = ReturnType<typeof getDb>;
