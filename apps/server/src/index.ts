import { Scalar } from "@scalar/hono-api-reference";
import { workflowsRouter } from "./routers/workflows";
import { trpcRouter } from "./routers/trpc";
import { createRouter } from "./lib";

const app = createRouter();

app
  .route("/workflows", workflowsRouter)
  .route("/trpc/*", trpcRouter)
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
