import { authRouter } from "./auth";
import { createTRPCRouter } from "../lib";

export const appRouter = createTRPCRouter({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
