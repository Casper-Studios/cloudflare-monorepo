import { initTRPC } from "@trpc/server";

type TRPCContext = {
  headers: Headers;
};

const t = initTRPC.context<TRPCContext>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
