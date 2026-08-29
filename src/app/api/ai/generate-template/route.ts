import { NextResponse } from "next/server";
import { z } from "zod";
import { SpamDetector } from "@/lib/compliance/spam-detector";

const aiPromptSchema = z.object({
  prompt: z.string().min(3, "Prompt is required"),
  tone: z.enum(["Professional", "Friendly", "Persuasive", "Urgent", "Casual"]).default("Professional"),
  brandName: z.string().optional().default("GEO Mail"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = aiPromptSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid AI prompt schema", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { prompt, tone, brandName } = validation.data;

    // AI Generation Engine (Template Synthesizer)
    const generatedSubject = generateAISubject(prompt, tone);
    const generatedHtml = generateAIHtmlTemplate(prompt, tone, brandName);

    // Spam Risk Analysis
    const spamCheck = SpamDetector.analyzeDetailed(`${generatedSubject} ${generatedHtml}`);

    return NextResponse.json(
      {
        success: true,
        subject: generatedSubject,
        htmlBody: generatedHtml,
        tone,
        spamAnalysis: spamCheck,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API /api/ai/generate-template Error]:", error);
    return NextResponse.json({ error: "Failed to generate AI email template" }, { status: 500 });
  }
}

function generateAISubject(prompt: string, tone: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("web development") || p.includes("course") || p.includes("eonixa")) {
    return tone === "Urgent"
      ? "🎓 Reserved Seats Open: Web Development Masterclass by Eonixa"
      : "🚀 Master Web Development with Eonixa: Registration Now Open";
  }
  if (p.includes("black friday") || p.includes("sale") || p.includes("discount")) {
    return tone === "Urgent"
      ? "🎉 Special Season Pass: Exclusive Early Access Offer"
      : "🏷️ Special Announcement Inside: Claim Your Member Benefits Today";
  }
  if (p.includes("welcome") || p.includes("onboarding")) {
    return "👋 Welcome aboard! Here is your quick start guide";
  }
  if (p.includes("launch") || p.includes("feature")) {
    return "🚀 Introducing New Features to Supercharge Your Growth";
  }
  return `✨ ${prompt.slice(0, 50)}`;
}

function generateAIHtmlTemplate(prompt: string, tone: string, brandName: string): string {
  const p = prompt.toLowerCase();
  const primaryColor = tone === "Urgent" ? "#dc2626" : tone === "Friendly" ? "#059669" : "#4f46e5";

  let title = "Exclusive Announcement";
  let paragraph = prompt;
  let highlights = [
    "Comprehensive curriculum designed by industry experts",
    "Hands-on real-world projects & practical assignments",
    "Flexible self-paced learning with mentor support",
  ];
  let ctaText = "Explore Program Details →";
  let ctaLink = "https://geonixa.com";

  if (p.includes("web development") || p.includes("course") || p.includes("eonixa")) {
    title = "Web Development Masterclass — Eonixa Edition";
    paragraph = "We are thrilled to announce that registration is officially open for the Web Development Masterclass from Eonixa. Designed for students and aspiring developers, this program gives you practical hands-on experience building modern web applications.";
    highlights = [
      "Full-Stack Web Development: HTML, CSS, JavaScript & Next.js",
      "Real-world project portfolio & live deployment guidance",
      "Limited batch capacity to ensure personalized mentorship",
    ];
    ctaText = "Secure Your Seat Now →";
  } else if (p.includes("sale") || p.includes("discount") || p.includes("black friday")) {
    title = "Exclusive Special Offer";
    paragraph = `We are excited to share an exclusive promotional offer tailored specifically for our subscribers: ${prompt}`;
    highlights = [
      "Special promotional pricing active for a short period",
      "Access to premium features & priority customer support",
      "Instant activation with zero setup delays",
    ];
    ctaText = "Claim Your Discount →";
  }

  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <!-- Header Banner -->
  <div style="background-color: ${primaryColor}; padding: 32px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 800; tracking-tight: -0.5px;">${title}</h1>
    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Powered by ${brandName}</p>
  </div>

  <!-- Body Content -->
  <div style="padding: 32px 24px; color: #334155; line-height: 1.6; font-size: 15px;">
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Hi {{subscriber.firstName}}! 👋</h2>

    <p style="margin-bottom: 20px;">${paragraph}</p>

    <!-- Key Feature Box -->
    <div style="background-color: #f8fafc; border-left: 4px solid ${primaryColor}; padding: 18px; margin: 24px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800;">Program Highlights:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
        <li style="margin-bottom: 8px;">${highlights[0]}</li>
        <li style="margin-bottom: 8px;">${highlights[1]}</li>
        <li style="margin-bottom: 0;">${highlights[2]}</li>
      </ul>
    </div>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${ctaLink}" style="background-color: ${primaryColor}; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        ${ctaText}
      </a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0 0 6px 0;">Office Address: {{workspace.physicalAddress}}</p>
    <p style="margin: 0;"><a href="{{unsubscribeUrl}}" style="color: ${primaryColor}; text-decoration: underline;">Unsubscribe from emails</a></p>
  </div>
</div>`;
}
