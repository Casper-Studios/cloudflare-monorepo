import { OpenAPIHono } from "@hono/zod-openapi";
import { WorkflowTriggerRequest } from "@repo/schemas";

export interface Bindings {
  DATABASE: D1Database;
  EXAMPLE_WORKFLOW: Workflow<WorkflowTriggerRequest>;
}

export const createRouter = () => new OpenAPIHono<{ Bindings: Bindings }>();
