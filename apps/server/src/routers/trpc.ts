import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@repo/trpc";
import { getDb } from "@repo/db";
import { TRPCContextOptions } from "@repo/trpc/lib";

import { createRouter } from "../lib";

export const trpcRouter = createRouter();

trpcRouter.use(
  "*",
  trpcServer({
    router: appRouter,
    createContext: async (opts, c) => {
      const auth = c.get("auth");

      return {
        database: await getDb(c.env.DATABASE),
        auth: auth,
        headers: opts.req.headers,
      } satisfies TRPCContextOptions;
    },
  })
);
