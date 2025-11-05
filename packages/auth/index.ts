import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@repo/db";
import * as schema from "@repo/db/schema";

export async function createAuth(
  database: ReturnType<typeof getDb>,
  options: {
    // baseUrl: string;
    productionUrl?: string;
    secret: string;
  }
) {
  return betterAuth({
    database: drizzleAdapter(database, {
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
    emailAndPassword: {
      enabled: true,
    },
  });
}

export type Auth = Awaited<ReturnType<typeof createAuth>>;

// export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"]["session"];
export type User = Auth["$Infer"]["Session"]["user"] & {
  role: "user" | "admin";
};
