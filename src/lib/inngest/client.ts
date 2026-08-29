import { Inngest } from "inngest";

export type TrackedEventPayload = {
  workspaceId: string;
  subscriberId?: string;
  subscriberEmail?: string;
  eventName: string;
  payload: Record<string, any>;
  timestamp: string;
};

export const inngest = new Inngest({
  id: "geo-mail-automation",
  name: "GEO Mail Automation Engine",
});
