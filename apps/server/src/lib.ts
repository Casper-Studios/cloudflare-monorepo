import { OpenAPIHono } from "@hono/zod-openapi";
import { Auth, Session, User } from "@repo/auth";
import { ExampleWorkflowRequestPayload } from "./workflows/example";

export interface Bindings extends Auth {
  DATABASE: D1Database;
  EXAMPLE_WORKFLOW: Workflow<ExampleWorkflowRequestPayload>;
}

export interface Variables {
  user: User | null;
  session: Session | null;
}

export const createRouter = () =>
  new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();
