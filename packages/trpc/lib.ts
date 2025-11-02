import { initTRPC } from "@trpc/server";

// import type { Auth } from "@acme/auth";
import { getDb } from "@repo/db";

// /**
//  * 1. CONTEXT
//  *
//  * This section defines the "contexts" that are available in the backend API.
//  *
//  * These allow you to access things when processing a request, like the database, the session, etc.
//  *
//  * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
//  * wrap this and provides the required context.
//  *
//  * @see https://trpc.io/docs/server/context
//  */

// export const createTRPCContext = async (opts: {
//   headers: Headers;
//   auth: Auth;
// }) => {
//   const authApi = opts.auth.api;
//   const session = await authApi.getSession({
//     headers: opts.headers,
//   });
//   return {
//     authApi,
//     session,
//     db,
//   };
// };

export type TRPCContext = {
  db: Awaited<ReturnType<typeof getDb>>;
};

const t = initTRPC.context<TRPCContext>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
