import { NextResponse } from "next/server";
import { WebhookDispatcher, WebhookEndpoint } from "@/lib/webhooks/webhook-dispatcher";

let inMemoryWebhooks: WebhookEndpoint[] = [
  {
    id: "wh_1",
    url: "https://hooks.zapier.com/hooks/catch/sample/geo-mail",
    workspaceId: "ws_geonixa",
    events: ["email.opened", "email.clicked", "contact.unsubscribed"],
    isActive: true,
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId") || "ws_geonixa";
  const list = inMemoryWebhooks.filter((w) => w.workspaceId === workspaceId);

  return NextResponse.json({ success: true, webhooks: list });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, workspaceId, events } = body;

    if (!url || !workspaceId) {
      return NextResponse.json({ error: "url and workspaceId are required" }, { status: 400 });
    }

    const newEndpoint: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      url,
      workspaceId,
      events: events || ["email.opened", "email.clicked"],
      secret: `whsec_${Math.random().toString(36).substring(2, 10)}`,
      isActive: true,
    };

    inMemoryWebhooks.push(newEndpoint);
    return NextResponse.json({ success: true, webhook: newEndpoint });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
