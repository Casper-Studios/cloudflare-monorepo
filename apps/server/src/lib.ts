import { OpenAPIHono } from "@hono/zod-openapi";
import { Auth } from "@repo/auth";
import { ExampleWorkflowRequestPayload } from "./workflows/example";

export interface Bindings extends Auth {
  DATABASE: D1Database;
  EXAMPLE_WORKFLOW: Workflow<ExampleWorkflowRequestPayload>;
}

export const createRouter = () => new OpenAPIHono<{ Bindings: Bindings }>();
