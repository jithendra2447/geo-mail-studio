import { NextResponse } from "next/server";
import { BackgroundEmailQueue } from "@/lib/queue/email-queue";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId parameter" }, { status: 400 });
  }

  const status = BackgroundEmailQueue.getJobStatus(jobId);

  if (!status) {
    return NextResponse.json({ error: "Job not found or completed" }, { status: 404 });
  }

  return NextResponse.json({ success: true, progress: status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId = "ws_geonixa", campaignId, subject, bodyHtml, fromName, fromEmail } = body;

    const subscribers = await prisma.subscriber.findMany({
      where: { workspaceId, status: "SUBSCRIBED" },
      select: { id: true, email: true, firstName: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers found in audience list" }, { status: 400 });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const job = await BackgroundEmailQueue.enqueueCampaign({
      jobId,
      workspaceId,
      campaignId: campaignId || `camp_${Date.now()}`,
      subscribers,
      subject,
      bodyHtml,
      fromName: fromName || "Geonixa Inc",
      fromEmail: fromEmail || "jithendravarma.l@gmail.com",
    });

    return NextResponse.json({
      success: true,
      message: `Background Email Queue Job '${jobId}' submitted for ${subscribers.length} recipients!`,
      job,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
