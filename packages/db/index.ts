import { drizzle as drizzleD1, DrizzleD1Database } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
export * as drizzleOrm from "drizzle-orm";

import * as schema from "./schema";

export function getDb(database: D1Database): DrizzleD1Database<typeof schema> {
  try {
    return drizzleD1(database, { schema, logger: true });
  } catch (err) {
    console.error("Failed to get database:", err);
    throw new Error("Failed to get database");
  }
}

export type Database = ReturnType<typeof getDb>;
