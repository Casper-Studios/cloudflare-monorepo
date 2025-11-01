import { initTRPC } from "@trpc/server";
import { authRouter } from "./auth";

const t = initTRPC.create();

export const publicProcedure = t.procedure;
const createTRPCRouter = t.router;

export const appRouter = createTRPCRouter({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
