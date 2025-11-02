import { z } from "zod";

// Workflow Trigger Schemas
export const WorkflowTriggerRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
  metadata: z.record(z.string(), z.string()).optional().default({}),
});

export const WorkflowTriggerResponseSchema = z.object({
  success: z.boolean(),
  instanceId: z.string(),
  message: z.string(),
});

// Workflow Status Schemas
export const WorkflowStatusParamsSchema = z.object({
  instanceId: z.string().min(1, "instanceId is required"),
});

export const WorkflowStatusResponseSchema = z.object({
  success: z.boolean(),
  status: z.any(),
  instance: z.any(),
});

// Error Response Schema
export const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
  details: z
    .array(
      z.object({
        path: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});

// Type exports for convenience
export type WorkflowTriggerRequest = z.infer<
  typeof WorkflowTriggerRequestSchema
>;
export type WorkflowTriggerResponse = z.infer<
  typeof WorkflowTriggerResponseSchema
>;
export type WorkflowStatusParams = z.infer<typeof WorkflowStatusParamsSchema>;
export type WorkflowStatusResponse = z.infer<
  typeof WorkflowStatusResponseSchema
>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
