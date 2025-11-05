import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "@repo/db";
import * as schema from "@repo/db/schema";

export async function createAuth(
  database: D1Database,
  options: {
    // baseUrl: string;
    productionUrl?: string;
    secret: string;
  }
) {
  const db = await getDb(database);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    secret: options.secret,
    // trustedOrigins: [
    //   "expo://",
    //   "http://localhost:3001",
    //   "http://localhost:3000",
    // ],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  });
}

export type Auth = Awaited<ReturnType<typeof createAuth>>;

// export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"]["session"];
export type User = Auth["$Infer"]["Session"]["user"];
