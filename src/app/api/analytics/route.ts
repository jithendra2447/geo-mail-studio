import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || "ws_geonixa";

    const totalSubscribers = await prisma.subscriber.count({ where: { workspaceId } });
    const activeSubscribers = await prisma.subscriber.count({ where: { workspaceId, status: "SUBSCRIBED" } });
    const unsubscribedCount = await prisma.subscriber.count({ where: { workspaceId, status: "UNSUBSCRIBED" } });

    const totalEmailsSent = await prisma.emailLog.count({ where: { workspaceId } });
    const openedCount = await prisma.emailLog.count({ where: { workspaceId, openedAt: { not: null } } });
    const clickedCount = await prisma.emailLog.count({ where: { workspaceId, clickedAt: { not: null } } });

    const openRate = totalEmailsSent > 0 ? ((openedCount / totalEmailsSent) * 100).toFixed(1) : "0.0";
    const clickRate = totalEmailsSent > 0 ? ((clickedCount / totalEmailsSent) * 100).toFixed(1) : "0.0";

    const recentLogs = await prisma.emailLog.findMany({
      where: { workspaceId },
      orderBy: { deliveredAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      workspaceId,
      metrics: {
        totalSubscribers,
        activeSubscribers,
        unsubscribedCount,
        totalEmailsSent,
        openedCount,
        clickedCount,
        openRatePercentage: parseFloat(openRate),
        clickRatePercentage: parseFloat(clickRate),
      },
      recentLogs,
    });
  } catch (error: any) {
    console.error("[GET /api/analytics Error]:", error);
    return NextResponse.json({ error: "Failed to load analytics metrics" }, { status: 500 });
  }
}
