import { AnyD1Database, drizzle as drizzleD1 } from "drizzle-orm/d1";

import * as schema from "./schema/index.js";

export async function getDb(database: AnyD1Database) {
  try {
    return drizzleD1(database, { schema, logger: true });
  } catch (err) {
    console.error("Failed to get database:", err);
    throw new Error("Failed to get database");
  }
}

export type Database = Awaited<ReturnType<typeof getDb>>;
