export type WebhookEventType =
  | "email.sent"
  | "email.opened"
  | "email.clicked"
  | "contact.unsubscribed"
  | "bounce.detected";

export interface WebhookEndpoint {
  id: string;
  url: string;
  workspaceId: string;
  events: WebhookEventType[];
  secret?: string;
  isActive: boolean;
}

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  workspaceId: string;
  data: Record<string, any>;
}

export class WebhookDispatcher {
  /**
   * Dispatch a real-time event payload to registered HTTP webhook endpoints
   */
  public static async dispatchEvent(
    endpoints: WebhookEndpoint[],
    event: WebhookEventType,
    workspaceId: string,
    data: Record<string, any>
  ): Promise<Array<{ url: string; success: boolean; status?: number }>> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      workspaceId,
      data,
    };

    const targetEndpoints = endpoints.filter(
      (ep) => ep.isActive && ep.workspaceId === workspaceId && ep.events.includes(event)
    );

    const results = await Promise.all(
      targetEndpoints.map(async (ep) => {
        try {
          const response = await fetch(ep.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "GEO-Mail-Studio-Webhook/1.0",
              "X-GEO-Signature": ep.secret || "geo_wh_secret",
            },
            body: JSON.stringify(payload),
          });

          return { url: ep.url, success: response.ok, status: response.status };
        } catch (err) {
          return { url: ep.url, success: false, status: 500 };
        }
      })
    );

    return results;
  }
}
