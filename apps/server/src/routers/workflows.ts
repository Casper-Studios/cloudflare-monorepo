import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "../lib";

const WorkflowTriggerRequestSchema = z
  .object({
    email: z.string().email().openapi({
      example: "user@example.com",
      description: "Email address for the workflow",
    }),
    metadata: z
      .record(z.string(), z.string())
      .optional()
      .default({})
      .openapi({
        example: { key: "value" },
        description: "Metadata for the workflow",
      }),
  })
  .openapi("WorkflowTriggerRequest");

const WorkflowTriggerResponseSchema = z
  .object({
    success: z.boolean().openapi({
      example: true,
    }),
    instanceId: z.string().openapi({
      example: "workflow-123",
    }),
    message: z.string().openapi({
      example: "Workflow triggered successfully",
    }),
  })
  .openapi("WorkflowTriggerResponse");

const ErrorResponseSchema = z
  .object({
    success: z.boolean().openapi({
      example: false,
    }),
    error: z.string().openapi({
      example: "Unknown error",
    }),
    details: z
      .array(
        z.object({
          path: z.string(),
          message: z.string(),
        })
      )
      .optional()
      .openapi({
        description: "Validation error details",
      }),
  })
  .openapi("ErrorResponse");

const workflowsRouter = createRouter();

workflowsRouter.openapi(
  createRoute({
    method: "post",
    path: "/trigger",
    tags: ["Workflows"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: WorkflowTriggerRequestSchema,
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: WorkflowTriggerResponseSchema,
          },
        },
        description: "Successfully triggered workflow",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Validation error",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Failed to trigger workflow",
      },
    },
  }),
  async (c) => {
    try {
      const body = c.req.valid("json");

      const response = await c.env.EXAMPLE_WORKFLOW.create({
        params: {
          email: body.email,
          metadata: body.metadata,
        },
      });

      return c.json(
        {
          success: true,
          instanceId: response.id,
          message: "Workflow triggered successfully",
          details: await response.status(),
        },
        200
      );
    } catch (error) {
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  }
);

export { workflowsRouter };
