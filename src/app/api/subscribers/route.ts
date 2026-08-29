import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const subscriberSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  email: z.string().email("Valid email is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  attributes: z.record(z.string(), z.any()).optional().default({}),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || "ws_geonixa";

    const subscribers = await prisma.subscriber.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const totalCount = await prisma.subscriber.count({ where: { workspaceId } });

    return NextResponse.json({
      success: true,
      workspaceId,
      totalCount,
      subscribers,
    });
  } catch (error: any) {
    console.error("[GET /api/subscribers Error]:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = subscriberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid subscriber schema", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { workspaceId, email, firstName, lastName, attributes } = validation.data;
    const jsonAttributes = JSON.stringify(attributes || {});

    const subscriber = await prisma.subscriber.upsert({
      where: {
        workspaceId_email: { workspaceId, email },
      },
      update: {
        firstName,
        lastName,
        attributes: jsonAttributes,
        status: "SUBSCRIBED",
      },
      create: {
        workspaceId,
        email,
        firstName,
        lastName,
        attributes: jsonAttributes,
        status: "SUBSCRIBED",
      },
    });

    return NextResponse.json(
      { success: true, message: "Subscriber saved successfully", subscriber },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/subscribers Error]:", error);
    return NextResponse.json({ error: "Failed to save subscriber" }, { status: 500 });
  }
}
