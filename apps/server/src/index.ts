import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@repo/trpc";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { getDb } from "@repo/db";
import {
  WorkflowTriggerRequestSchema,
  WorkflowTriggerResponseSchema,
  WorkflowStatusParamsSchema,
  WorkflowStatusResponseSchema,
  ErrorResponseSchema,
} from "@repo/schemas";

interface Bindings {
  DATABASE: D1Database;
  WORKFLOWS: Fetcher;
}

const app = new OpenAPIHono<{ Bindings: Bindings }>();

// Root endpoint
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// OpenAPI-enhanced Zod Schemas
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

// Endpoint to trigger a workflow
app.openapi(
  createRoute({
    method: "post",
    path: "/workflows/trigger",
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

      // Validate with shared schema before sending to workflow
      const validation = WorkflowTriggerRequestSchema.safeParse(body);
      if (!validation.success) {
        return c.json(
          {
            success: false,
            error: "Validation error",
            details: validation.error.issues.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
          400
        );
      }

      const response = await c.env.WORKFLOWS.fetch(
        new Request("http://workflows-starter/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validation.data),
        })
      );

      const result =
        (await response.json()) as typeof WorkflowTriggerResponseSchema._type;

      // Validate response from workflow
      const responseValidation =
        WorkflowTriggerResponseSchema.safeParse(result);
      if (!responseValidation.success) {
        console.error("Workflow returned invalid response:", result);
        return c.json(
          {
            success: false,
            error: "Invalid response from workflow",
          },
          500
        );
      }

      return c.json(responseValidation.data, 200);
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

// Endpoint to check workflow status
app.openapi(
  createRoute({
    method: "get",
    path: "/workflows/status/{instanceId}",
    tags: ["Workflows"],
    request: {
      params: WorkflowStatusParamsSchemaOpenAPI,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: WorkflowStatusResponseSchemaOpenAPI,
          },
        },
        description: "Successfully retrieved workflow status",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchemaOpenAPI,
          },
        },
        description: "Failed to retrieve workflow status",
      },
    },
  }),
  async (c) => {
    try {
      const { instanceId } = c.req.valid("param");
      const response = await c.env.WORKFLOWS.fetch(
        new Request(`http://workflows-starter/?instanceId=${instanceId}`)
      );

      const result = await response.json();

      // Validate response from workflow
      const responseValidation = WorkflowStatusResponseSchema.safeParse(result);
      if (!responseValidation.success) {
        console.error("Workflow returned invalid status response:", result);
        return c.json(
          {
            success: false,
            error: "Invalid response from workflow",
          },
          500
        );
      }

      return c.json(
        {
          success: responseValidation.data.success,
          status: responseValidation.data.status,
          instance: responseValidation.data.instance,
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

// OpenAPI documentation endpoint
app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "Cloudflare Server API",
    description: "API for managing workflows and database operations",
  },
  tags: [
    {
      name: "Workflows",
      description: "Endpoints for triggering and monitoring workflows",
    },
  ],
});

// Scalar API Reference UI
app.get(
  "/scalar",
  Scalar({
    url: "/doc",
    theme: "default",
    pageTitle: "Cloudflare Server API Documentation",
  })
);

export default app;
