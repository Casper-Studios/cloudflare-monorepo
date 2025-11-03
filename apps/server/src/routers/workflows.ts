import { createRoute, z } from "@hono/zod-openapi";
import {
  WorkflowTriggerRequestSchema,
  WorkflowTriggerResponseSchema,
  WorkflowStatusResponseSchema,
} from "@repo/schemas";
import { createRouter } from "../lib";

const WorkflowTriggerRequestSchemaOpenAPI = z
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

const WorkflowTriggerResponseSchemaOpenAPI = z
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

const WorkflowStatusParamsSchemaOpenAPI = z
  .object({
    instanceId: z
      .string()
      .min(1)
      .openapi({
        param: {
          name: "instanceId",
          in: "path",
        },
        example: "workflow-123",
        description: "The unique identifier for the workflow instance",
      }),
  })
  .openapi("WorkflowStatusParams");

const WorkflowStatusResponseSchemaOpenAPI = z
  .object({
    success: z.boolean().openapi({
      example: true,
    }),
    status: z.any().openapi({
      description: "Workflow status",
    }),
    instance: z.any().openapi({
      description: "Workflow instance details",
    }),
  })
  .openapi("WorkflowStatusResponse");

const ErrorResponseSchemaOpenAPI = z
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

export const workflowsRouter = createRouter();

workflowsRouter.openapi(
  createRoute({
    method: "post",
    path: "/trigger",
    tags: ["Workflows"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: WorkflowTriggerRequestSchemaOpenAPI,
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: WorkflowTriggerResponseSchemaOpenAPI,
          },
        },
        description: "Successfully triggered workflow",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchemaOpenAPI,
          },
        },
        description: "Validation error",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchemaOpenAPI,
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
