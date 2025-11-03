import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { oAuthProxy } from "better-auth/plugins";
import type { Database } from "@repo/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export function initAuth(
  db: Database,
  options: {
    baseUrl: string;
    productionUrl: string;
    secret: string | undefined;
  }
): ReturnType<typeof betterAuth> {
  const config = {
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins: [
      oAuthProxy({
        productionURL: options.productionUrl,
      }),
    ],
    trustedOrigins: ["expo://"],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = {
  user: ReturnType<typeof betterAuth>["$Infer"]["Session"]["user"] | null;
  session: ReturnType<typeof betterAuth>["$Infer"]["Session"]["session"] | null;
};
