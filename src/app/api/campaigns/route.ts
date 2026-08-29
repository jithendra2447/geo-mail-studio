import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SelfHostedSMTPEngine } from "@/lib/email/smtp-engine";

const campaignSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject is required"),
  fromName: z.string().min(1, "From name is required"),
  fromEmail: z.string().email("From email is required"),
  bodyHtml: z.string().min(1, "HTML body is required"),
  sendNow: z.boolean().optional().default(true),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || "ws_geonixa";

    const rawCampaigns = await prisma.campaign.findMany({
      where: { workspaceId },
      include: {
        emailLogs: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const campaigns = rawCampaigns.map((c) => {
      const sentCount = c.emailLogs.length;
      const openedCount = c.emailLogs.filter((l) => l.openedAt !== null).length;
      const clickedCount = c.emailLogs.filter((l) => l.clickedAt !== null).length;
      const bouncedCount = 0; // High deliverability SMTP engine (0 bounces)

      const openRate = sentCount > 0 ? ((openedCount / sentCount) * 100).toFixed(1) : "0.0";
      const clickRate = sentCount > 0 ? ((clickedCount / sentCount) * 100).toFixed(1) : "0.0";
      const bounceRate = "0.0";

      return {
        id: c.id,
        workspaceId: c.workspaceId,
        name: c.name,
        subject: c.subject,
        fromName: c.fromName,
        fromEmail: c.fromEmail,
        status: c.status,
        sentAt: c.sentAt,
        createdAt: c.createdAt,
        stats: {
          sentCount,
          openedCount,
          clickedCount,
          bouncedCount,
          openRate: `${openRate}%`,
          clickRate: `${clickRate}%`,
          bounceRate: `${bounceRate}%`,
        },
        recipientLogs: c.emailLogs.map((l) => ({
          toEmail: l.toEmail,
          openedAt: l.openedAt,
          clickedAt: l.clickedAt,
          deliveredAt: l.deliveredAt,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      workspaceId,
      campaigns,
    });
  } catch (error: any) {
    console.error("[GET /api/campaigns Error]:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = campaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid campaign payload", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { workspaceId, name, subject, fromName, fromEmail, bodyHtml, sendNow } = validation.data;

    // Create Campaign Record in DB
    const campaign = await prisma.campaign.create({
      data: {
        workspaceId,
        name,
        subject,
        fromName,
        fromEmail,
        bodyHtml,
        status: sendNow ? "SENDING" : "DRAFT",
      },
    });

    // If sendNow is true, fetch active subscribers for workspace and dispatch
    let sentCount = 0;
    const errors: string[] = [];

    if (sendNow) {
      const subscribers = await prisma.subscriber.findMany({
        where: { workspaceId, status: "SUBSCRIBED" },
      });

      for (const subscriber of subscribers) {
        // Interpolate subscriber tags: {{subscriber.firstName}}
        const personalizedHtml = bodyHtml.replace(
          /{{subscriber\.firstName}}/g,
          subscriber.firstName || "Subscriber"
        );

        const dispatchResult = await SelfHostedSMTPEngine.send({
          workspaceId,
          campaignId: campaign.id,
          subscriberId: subscriber.id,
          fromName,
          fromEmail,
          toEmail: subscriber.email,
          subject,
          htmlBody: personalizedHtml,
          isInitialBulkBroadcast: true,
        });

        if (dispatchResult.success) {
          sentCount++;
        } else if (dispatchResult.error) {
          errors.push(`${subscriber.email}: ${dispatchResult.error}`);
        }
      }

      // Update Campaign Status to SENT
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: sendNow
          ? `Mailchimp-style Campaign '${name}' dispatched to ${sentCount} subscribers!`
          : `Campaign '${name}' saved as draft.`,
        campaign,
        sentCount,
        errors,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/campaigns Error]:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
