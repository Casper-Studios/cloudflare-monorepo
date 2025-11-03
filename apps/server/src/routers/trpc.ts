import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@repo/trpc";
import { getDb } from "@repo/db";
import { createRouter } from "../lib";
import { getAuth } from "../auth";
import { TRPCContextOptions } from "@repo/trpc/lib";

export const trpcRouter = createRouter();

trpcRouter.use(
  "*",
  trpcServer({
    router: appRouter,
    createContext: async (opts, c) => {
      return {
        database: await getDb(c.env.DATABASE),
        auth: {
          user: c.get("user"),
          session: c.get("session"),
        },
        headers: opts.req.headers,
      } satisfies TRPCContextOptions;
    },
  })
);
