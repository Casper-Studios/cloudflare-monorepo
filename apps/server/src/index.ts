import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@repo/trpc";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  })
);

export default app;
