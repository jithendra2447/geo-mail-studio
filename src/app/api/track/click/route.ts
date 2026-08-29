import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  const msgId = searchParams.get("msgId");
  const workspaceId = searchParams.get("ws");

  if (targetUrl) {
    if (msgId && workspaceId) {
      // Asynchronously record click in DB
      (async () => {
        try {
          await prisma.emailLog.updateMany({
            where: { messageId: msgId, workspaceId },
            data: { clickedAt: new Date() },
          });

          await prisma.event.create({
            data: {
              workspaceId,
              name: "email.clicked",
              payload: JSON.stringify({ messageId: msgId, targetUrl, clickedAt: new Date().toISOString() }),
            },
          });
          console.log(`[Analytics Click Tracked]: Link ${targetUrl} clicked in Msg ${msgId}`);
        } catch (err) {
          console.error("[Analytics Click Track Error]:", err);
        }
      })();
    }

    // 302 Redirect to destination URL
    return NextResponse.redirect(targetUrl, 302);
  }

  // Fallback to home page if no URL specified
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(baseUrl, 302);
}
