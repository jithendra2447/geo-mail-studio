import { NextResponse } from "next/server";
import { z } from "zod";
import { SpamDetector } from "@/lib/compliance/spam-detector";

const fixSpamSchema = z.object({
  text: z.string().min(3, "Content is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = fixSpamSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid text schema", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { text } = validation.data;

    // AI Smart Synonym Rewriter (Preserves full content structure, swaps trigger words)
    const fixedText = rewriteWithSmartSynonyms(text);

    // Verify Spam Risk Analysis post-fix
    const spamCheck = SpamDetector.analyzeDetailed(fixedText);

    return NextResponse.json(
      {
        success: true,
        originalText: text,
        fixedText,
        spamAnalysis: spamCheck,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API /api/ai/fix-spam Error]:", error);
    return NextResponse.json({ error: "Failed to AI auto-fix spam content" }, { status: 500 });
  }
}

/**
 * AI Smart Rewriter: Replaces spam trigger words with professional, high-converting synonyms while keeping 100% of sentences intact.
 */
function rewriteWithSmartSynonyms(text: string): string {
  let result = text;

  const synonymMap: [RegExp, string][] = [
    [/\bJob Guarantee\b/gi, "Career Acceleration Program"],
    [/\b100% placement guarantee\b/gi, "complete placement track record"],
    [/\bplacement guarantee\b/gi, "placement support track record"],
    [/\bGuaranteed placements\b/gi, "Assured placements"],
    [/\bguaranteed placements\b/gi, "assured placements"],
    [/\bGuaranteed\b/g, "Assured"],
    [/\bguaranteed\b/g, "assured"],
    [/\b100% free\b/gi, "fully complimentary"],
    [/\b100%\b/gi, "complete"],
    [/\bDear friend\b/gi, "Hello Innovator"],
    [/\bFinancial Consultant\b/gi, "Capital Management Advisor"],
    [/\bprivately owned funds\b/gi, "private equity capital"],
    [/\bfinance projects\b/gi, "capitalize projects"],
    [/\b5% ROI\b/gi, "5% annual return"],
    [/\bPlease answer ASAP\b/gi, "We kindly welcome your response at your convenience."],
    [/\bASAP\b/gi, "at your convenience"],
    [/\bPlease answer\b/gi, "We kindly welcome your response"],
    [/\bact now\b/gi, "reserve your spot today"],
    [/\burgent\b/gi, "time-sensitive"],
    [/\bmake money\b/gi, "generate revenue"],
    [/\bearn \$\$\$\b/gi, "maximize yield"],
    [/\brisk free\b/gi, "zero-risk"],
    [/\blimited slots\b/gi, "selective seating"],
    [/\bbuy now\b/gi, "enroll today"],
    [/\bclick here now\b/gi, "explore program details"],
  ];

  for (const [regex, synonym] of synonymMap) {
    result = result.replace(regex, synonym);
  }

  return result;
}
