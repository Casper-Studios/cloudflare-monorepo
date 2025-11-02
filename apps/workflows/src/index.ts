import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import {
	WorkflowTriggerRequestSchema,
	WorkflowStatusParamsSchema,
	type WorkflowTriggerRequest,
} from '@repo/schemas';

type Env = {
	// Add your bindings here, e.g. Workers KV, D1, Workers AI, etc.
	MY_WORKFLOW: Workflow;
};

// User-defined params passed to your workflow
type Params = WorkflowTriggerRequest;

export class ExampleWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
		console.log('Workflow started', event);
		await step.sleep('sleep for a bit', '1 minute');
		console.log('Workflow finished', event);

		return {
			success: true,
			message: 'Workflow finished',
		};
	}
}

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const url = new URL(req.url);

		if (req.method === 'POST') {
			try {
				const contentType = req.headers.get('content-type');
				if (!contentType?.includes('application/json')) {
					return Response.json(
						{
							success: false,
							error: 'Content-Type must be application/json',
						},
						{ status: 400 },
					);
				}

				const text = await req.text();
				if (!text || text.trim().length === 0) {
					return Response.json(
						{
							success: false,
							error: 'Request body is required',
						},
						{ status: 400 },
					);
				}

				let body: unknown;
				try {
					body = JSON.parse(text);
				} catch (parseError) {
					return Response.json(
						{
							success: false,
							error: 'Invalid JSON in request body',
						},
						{ status: 400 },
					);
				}

			console.log('body', body);

			// Validate params with Zod
			const validation = WorkflowTriggerRequestSchema.safeParse(body);
			if (!validation.success) {
					return Response.json(
						{
							success: false,
							error: 'Validation error',
							details: validation.error.issues.map((err) => ({
								path: err.path.join('.'),
								message: err.message,
							})),
						},
						{ status: 400 },
					);
				}

				const params = validation.data;

				// Create and start the workflow instance
				const instance = await env.MY_WORKFLOW.create({ params });
				console.log(`Started workflow: ${instance.id}`);

				return Response.json({
					success: true,
					instanceId: instance.id,
					message: 'Workflow triggered successfully',
				});
			} catch (error) {
				console.error('Failed to trigger workflow:', error);
				return Response.json(
					{
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
					},
					{ status: 500 },
				);
			}
		}

		// Handle GET request to check workflow status
		if (req.method === 'GET') {
			const queryParams = {
				instanceId: url.searchParams.get('instanceId'),
			};

			const validation = WorkflowStatusParamsSchema.safeParse(queryParams);
			if (!validation.success) {
				return Response.json(
					{
						success: false,
						error: 'Validation error',
						details: validation.error.issues.map((err: { path: (string | number)[]; message: string }) => ({
							path: err.path.join('.'),
							message: err.message,
						})),
					},
					{ status: 400 },
				);
			}

			try {
				const instance = await env.MY_WORKFLOW.get(validation.data.instanceId);
				return Response.json({
					success: true,
					status: instance.status,
					instance: instance,
				});
			} catch (error) {
				console.error('Failed to get workflow status:', error);
				return Response.json(
					{
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
					},
					{ status: 500 },
				);
			}
		}

		return new Response('Not found', { status: 404 });
	},
	// async scheduled(
	//   controller: ScheduledController,
	//   env: Env,
	//   ctx: ExecutionContext,
	// ) {
	//   const params: Params = {
	//     accountId: "{accountId}",
	//     databaseId: "{databaseId}",
	//   };
	//   const instance = await env.BACKUP_WORKFLOW.create({ params });
	//   console.log(`Started workflow: ${instance.id}`);
	// },
};
