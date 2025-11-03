import { getDb } from "@repo/db";
import { env } from "cloudflare:workers";
import { initAuth } from "@repo/auth";

const db = await getDb(env.DATABASE);

export const auth = initAuth(db, {
  baseUrl: "http://localhost:3000",
  productionUrl: "https://your-production-url.com",
  secret: "secret",
});
