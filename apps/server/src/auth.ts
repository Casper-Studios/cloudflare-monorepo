import { getDb } from "@repo/db";
import { initAuth } from "@repo/auth";
import type { Bindings } from "./lib";

let authInstance: ReturnType<typeof initAuth> | null = null;

export async function getAuth(env: Bindings["DATABASE"]) {
  if (!authInstance) {
    const db = await getDb(env);
    authInstance = initAuth(db, {
      baseUrl: "http://localhost:3000",
      productionUrl: "https://your-production-url.com",
      secret: "secret",
    });
  }
  return authInstance;
}
