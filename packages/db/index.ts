import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";

import * as schema from "./schema/index.js";

export async function getDb(database: D1Database) {
  try {
    return drizzleD1(database, { schema, logger: true });
  } catch (err) {
    console.error("Failed to get database:", err);
    throw new Error("Failed to get database");
  }
}

export type Database = Awaited<ReturnType<typeof getDb>>;
