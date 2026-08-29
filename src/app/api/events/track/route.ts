import { NextResponse } from "next/server";
import { z } from "zod";
import { inngest } from "@/lib/inngest/client";

// Strict validation schema for incoming event payloads
const trackEventSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required for multi-tenant isolation"),
  subscriberId: z.string().optional(),
  subscriberEmail: z.string().email().optional(),
  name: z.string().min(1, "Event name is required"),
  payload: z.record(z.string(), z.any()).default({}),
});

/**
 * POST /api/events/track
 * Ingests custom track events, pushes to Inngest event pipeline, returns 200 OK immediately.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = trackEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid event payload",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { workspaceId, subscriberId, subscriberEmail, name, payload } = validation.data;

    // Asynchronously dispatch event to Inngest background queue (non-blocking)
    await inngest.send({
      name: "app/event.tracked",
      data: {
        workspaceId,
        subscriberId,
        subscriberEmail,
        eventName: name,
        payload,
        timestamp: new Date().toISOString(),
      },
    });

    // Return immediate 200 OK response to caller
    return NextResponse.json(
      {
        success: true,
        message: "Event ingested successfully",
        workspaceId,
        eventName: name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API /api/events/track Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
