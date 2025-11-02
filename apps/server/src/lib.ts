import { OpenAPIHono } from "@hono/zod-openapi";

export interface Bindings {
  DATABASE: D1Database;
  WORKFLOWS: Fetcher;
}

export const createRouter = () => new OpenAPIHono<{ Bindings: Bindings }>();
