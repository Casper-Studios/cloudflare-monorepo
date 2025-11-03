import { Scalar } from "@scalar/hono-api-reference";
import { workflowsRouter } from "./routers/workflows";
import { trpcRouter } from "./routers/trpc";
import { createRouter } from "./lib";
import { cors } from "hono/cors";
import { getAuth } from "./auth";

const app = createRouter();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3001"],
    // allowHeaders: [
    //   "Content-Type",
    //   "Authorization",
    //   "x-trpc-source",
    //   "data",
    //   "token",
    //   "session",
    // ],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.use("*", async (c, next) => {
  const auth = await getAuth(c.env.DATABASE);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session);
  await next();
});

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const auth = await getAuth(c.env.DATABASE);
  return auth.handler(c.req.raw);
});

app
  .route("/workflows", workflowsRouter)
  .route("/trpc/*", trpcRouter)
  // .route("/auth", authRouter)
  .doc("/doc", {
    openapi: "3.1.0",
    info: {
      version: "1.0.0",
      title: "Cloudflare Server API",
      description: "API for managing workflows and database operations",
    },
  })
  .get(
    "/scalar",
    Scalar({
      url: "/doc",
      theme: "default",
      pageTitle: "Cloudflare Server API Documentation",
    })
  );

export { ExampleWorkflow } from "./workflows/example";

export default app;
