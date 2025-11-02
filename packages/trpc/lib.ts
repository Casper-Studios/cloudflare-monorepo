import { initTRPC } from "@trpc/server";

// import type { Auth } from "@acme/auth";
import { getDb } from "@repo/db";

// Generated from server/index.ts generateContext, we just define the types here.
export interface TRPCContext {
  db: Awaited<ReturnType<typeof getDb>>;
}

const t = initTRPC.context<TRPCContext>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
