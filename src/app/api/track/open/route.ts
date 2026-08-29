import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1x1 transparent GIF binary buffer
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const messageId = searchParams.get("msgId");
  const workspaceId = searchParams.get("ws");
  const subscriberId = searchParams.get("sub");

  if (messageId && workspaceId) {
    // Asynchronously log open event in database
    (async () => {
      try {
        await prisma.emailLog.updateMany({
          where: { messageId, workspaceId },
          data: { openedAt: new Date() },
        });

        await prisma.event.create({
          data: {
            workspaceId,
            subscriberId: subscriberId || null,
            name: "email.opened",
            payload: JSON.stringify({ messageId, openedAt: new Date().toISOString() }),
          },
        });
        console.log(`[Analytics Open Tracked]: Msg ${messageId} for Workspace ${workspaceId}`);
      } catch (err) {
        console.error("[Analytics Open Track Error]:", err);
      }
    })();
  }

  // Return 1x1 transparent GIF image immediately
  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": TRANSPARENT_GIF.length.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
    },
  });
}
