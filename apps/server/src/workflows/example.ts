import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { Bindings } from "../lib";
import { userRepository } from "@repo/repositories";
import { getDb } from "@repo/db";

export interface ExampleWorkflowRequestPayload {
  email: string;
  metadata: Record<string, string>;
}
export class ExampleWorkflow extends WorkflowEntrypoint<
  Bindings,
  ExampleWorkflowRequestPayload
> {
  async run(
    event: WorkflowEvent<ExampleWorkflowRequestPayload>,
    step: WorkflowStep
  ) {
    console.log("Workflow started", event);
    await step.sleep("sleep for a bit", "1 minute");

    const db = await getDb(this.env.DATABASE);
    const user = await userRepository.getUser(db, { id: 1 });

    console.log("Workflow finished", user);

    return {
      success: true,
      message: "Workflow finished",
      user: user,
    };
  }
}
