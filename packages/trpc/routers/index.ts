import { authRouter } from "./auth";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { createTRPCRouter } from "../lib";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
