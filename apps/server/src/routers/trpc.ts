import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@repo/trpc";
import { getDb } from "@repo/db";
import { createRouter } from "../lib";

export const trpcRouter = createRouter();

trpcRouter.use(
  "*",
  trpcServer({
    router: appRouter,
    createContext: async (_, c) => {
      return {
        db: await getDb(c.env.DATABASE),
      };
    },
  })
);
