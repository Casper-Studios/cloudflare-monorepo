import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@repo/trpc";
import { Hono } from "hono";
import { getDb } from "@repo/db";

interface Bindings {
  DATABASE: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: async (_, c) => {
      return {
        db: await getDb(c.env.DATABASE),
      };
    },
  })
);

export default app;
