import superjson from "superjson";
import z, { ZodError } from "zod";
import { initTRPC, TRPCError } from "@trpc/server";

import { getDb } from "@repo/db";
import type { Auth } from "@repo/auth";

export interface TRPCContextOptions {
  headers: Headers;
  auth: Auth | null;
  database: Awaited<ReturnType<typeof getDb>>;
}

const t = initTRPC.context<TRPCContextOptions>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
          : null,
    },
  }),
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      auth: ctx.auth!,
    },
  });
});
