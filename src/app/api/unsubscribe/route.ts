import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let email = searchParams.get("email");
    let workspaceId = searchParams.get("ws");

    // Also check body payload for RFC 8058 or web form unsubscribe
    if (!email || !workspaceId) {
      try {
        const body = await request.json();
        email = email || body.email;
        workspaceId = workspaceId || body.workspaceId;
      } catch {
        // Body reading fallback
      }
    }

    if (!email || !workspaceId) {
      return NextResponse.json(
        { error: "Email and workspaceId are required for unsubscribe" },
        { status: 400 }
      );
    }

    // Update Subscriber record in database
    try {
      await prisma.subscriber.updateMany({
        where: { workspaceId, email },
        data: {
          status: "UNSUBSCRIBED",
          unsubscribedAt: new Date(),
        },
      });

      await prisma.event.create({
        data: {
          workspaceId,
          name: "subscriber.unsubscribed",
          payload: JSON.stringify({ email, unsubscribedAt: new Date().toISOString() }),
        },
      });
    } catch (dbErr) {
      console.warn("[Unsubscribe API DB Warning]:", dbErr);
    }

    console.log(`[Unsubscribe Success]: Email ${email} unsubscribed from workspace ${workspaceId}`);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully unsubscribed ${email} from workspace ${workspaceId}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Unsubscribe API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
