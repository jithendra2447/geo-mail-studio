import { NextResponse } from "next/server";
import { z } from "zod";
import { SelfHostedSMTPEngine } from "@/lib/email/smtp-engine";

const sendEmailSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  fromName: z.string().min(1, "From Name is required"),
  fromEmail: z.string().email("Valid From Email is required"),
  toEmail: z.string().email("Valid Recipient Email is required"),
  subject: z.string().min(1, "Subject is required"),
  htmlBody: z.string().min(1, "HTML Body is required"),
  textBody: z.string().optional(),
  subscriberId: z.string().optional(),
  campaignId: z.string().optional(),
  authenticatedDomain: z.string().optional(),
  physicalAddress: z.string().optional(),
  isInitialBulkBroadcast: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = sendEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid email request schema",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Dispatch via 100% Self-Hosted SMTP Engine with compliance & tracking auto-injected
    const result = await SelfHostedSMTPEngine.send(validation.data);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          complianceErrors: result.complianceErrors,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.simulated
          ? "Email validated, compliance-checked & dispatched via Self-Hosted Local Transport (Simulated)"
          : "Email validated & dispatched via Self-Hosted SMTP Engine",
        messageId: result.messageId,
        simulated: result.simulated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API /api/emails/send Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
