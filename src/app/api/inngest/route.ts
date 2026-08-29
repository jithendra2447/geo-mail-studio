import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";

// Background Job Function: Process tracked events and trigger matching workflows
export const processTrackedEvent = inngest.createFunction(
  {
    id: "process-tracked-event",
    name: "Process Tracked Event",
    triggers: [{ event: "app/event.tracked" }],
  },
  async ({ event, step }: { event: any; step: any }) => {
    const data = event.data as { workspaceId: string; eventName: string };

    await step.run("log-event", async () => {
      console.log(`[Inngest Job] Processing event '${data.eventName}' for tenant: ${data.workspaceId}`);
      return { status: "logged", workspaceId: data.workspaceId, eventName: data.eventName };
    });

    await step.run("evaluate-workflows", async () => {
      return { triggeredWorkflowsCount: 0 };
    });

    return { success: true, processedAt: new Date().toISOString() };
  }
);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processTrackedEvent],
});
