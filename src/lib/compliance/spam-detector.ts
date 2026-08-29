export type SpamCategory = "Urgency" | "Shady" | "Overpromise" | "Unnatural";

export interface SpamHighlightMatch {
  word: string;
  category: SpamCategory;
  color: string;
  index: number;
}

export interface CategorySummary {
  category: SpamCategory;
  count: number;
  icon: string;
  colorClass: string;
  badgeBg: string;
}

export interface DetailedSpamAnalysis {
  overallScore: "Excellent" | "Good" | "Needs Work" | "Poor";
  scoreNumber: number;
  wordCount: number;
  readTime: string;
  highlights: SpamHighlightMatch[];
  categorySummaries: CategorySummary[];
  recommendations: string[];
}

export class SpamDetector {
  private static SPAM_DICTIONARY: { word: string; category: SpamCategory; color: string }[] = [
    // 🚨 Urgency Category
    { word: "ASAP", category: "Urgency", color: "bg-red-200 text-red-900 border-red-300" },
    { word: "act now", category: "Urgency", color: "bg-red-200 text-red-900 border-red-300" },
    { word: "urgent", category: "Urgency", color: "bg-red-200 text-red-900 border-red-300" },
    { word: "immediately", category: "Urgency", color: "bg-red-200 text-red-900 border-red-300" },
    { word: "limited time", category: "Urgency", color: "bg-red-200 text-red-900 border-red-300" },
    { word: "last chance", category: "Urgency", color: "bg-red-200 text-red-900 border-red-300" },
    { word: "hurry", category: "Urgency", color: "bg-red-200 text-red-900 border-red-300" },

    // 🔞 Shady Category
    { word: "Dear friend", category: "Shady", color: "bg-pink-200 text-pink-900 border-pink-300" },
    { word: "Financial", category: "Shady", color: "bg-pink-200 text-pink-900 border-pink-300" },
    { word: "privately owned funds", category: "Shady", color: "bg-pink-200 text-pink-900 border-pink-300" },
    { word: "finance", category: "Shady", color: "bg-pink-200 text-pink-900 border-pink-300" },
    { word: "invest", category: "Shady", color: "bg-pink-200 text-pink-900 border-pink-300" },
    { word: "funds", category: "Shady", color: "bg-pink-200 text-pink-900 border-pink-300" },
    { word: "credit card", category: "Shady", color: "bg-pink-200 text-pink-900 border-pink-300" },

    // 🤩 Overpromise Category
    { word: "Guaranteed", category: "Overpromise", color: "bg-amber-200 text-amber-900 border-amber-300" },
    { word: "guaranteed", category: "Overpromise", color: "bg-amber-200 text-amber-900 border-amber-300" },
    { word: "5%", category: "Overpromise", color: "bg-amber-200 text-amber-900 border-amber-300" },
    { word: "100% placement", category: "Overpromise", color: "bg-amber-200 text-amber-900 border-amber-300" },
    { word: "100% free", category: "Overpromise", color: "bg-amber-200 text-amber-900 border-amber-300" },
    { word: "risk free", category: "Overpromise", color: "bg-amber-200 text-amber-900 border-amber-300" },

    // 💬 Unnatural Category
    { word: "Please answer", category: "Unnatural", color: "bg-purple-200 text-purple-900 border-purple-300" },
    { word: "kindly reply", category: "Unnatural", color: "bg-purple-200 text-purple-900 border-purple-300" },
  ];

  public static analyzeDetailed(text: string): DetailedSpamAnalysis {
    const rawText = text.replace(/<[^>]*>/g, " ");
    const words = rawText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const readSeconds = Math.ceil((wordCount / 200) * 60);
    const readTime = wordCount < 50 ? "a few seconds" : `${readSeconds} sec read`;

    const highlights: SpamHighlightMatch[] = [];
    const counts: Record<SpamCategory, number> = {
      Urgency: 0,
      Shady: 0,
      Overpromise: 0,
      Unnatural: 0,
    };

    for (const item of this.SPAM_DICTIONARY) {
      const regex = new RegExp(`\\b${this.escapeRegex(item.word)}\\b`, "gi");
      let match;
      while ((match = regex.exec(rawText)) !== null) {
        highlights.push({
          word: match[0],
          category: item.category,
          color: item.color,
          index: match.index,
        });
        counts[item.category] += 1;
      }
    }

    const totalSpamWords = highlights.length;

    let overallScore: DetailedSpamAnalysis["overallScore"] = "Excellent";
    let scoreNumber = 0;

    if (totalSpamWords >= 4) {
      overallScore = "Poor";
      scoreNumber = 85;
    } else if (totalSpamWords >= 2) {
      overallScore = "Needs Work";
      scoreNumber = 55;
    } else if (totalSpamWords >= 1) {
      overallScore = "Good";
      scoreNumber = 25;
    }

    const categorySummaries: CategorySummary[] = [
      {
        category: "Urgency",
        count: counts.Urgency,
        icon: "🚨",
        colorClass: "text-red-700 bg-red-50 border-red-200",
        badgeBg: "bg-red-500",
      },
      {
        category: "Shady",
        count: counts.Shady,
        icon: "🔞",
        colorClass: "text-pink-700 bg-pink-50 border-pink-200",
        badgeBg: "bg-pink-500",
      },
      {
        category: "Overpromise",
        count: counts.Overpromise,
        icon: "🤩",
        colorClass: "text-amber-700 bg-amber-50 border-amber-200",
        badgeBg: "bg-amber-500",
      },
      {
        category: "Unnatural",
        count: counts.Unnatural,
        icon: "💬",
        colorClass: "text-purple-700 bg-purple-50 border-purple-200",
        badgeBg: "bg-purple-500",
      },
    ];

    const recommendations: string[] = [];
    if (counts.Urgency > 0) recommendations.push("Replace high-urgency words like ASAP or Urgent.");
    if (counts.Shady > 0) recommendations.push("Avoid financial terms like 'funds', 'finance', or 'Dear friend'.");
    if (counts.Overpromise > 0) recommendations.push("Rephrase overpromising terms like 'Guaranteed' or '100% placement'.");
    if (counts.Unnatural > 0) recommendations.push("Use natural, conversational greetings.");

    return {
      overallScore,
      scoreNumber,
      wordCount,
      readTime,
      highlights,
      categorySummaries,
      recommendations,
    };
  }

  public static renderHighlightedHtml(text: string): string {
    let rendered = text;

    for (const item of this.SPAM_DICTIONARY) {
      const regex = new RegExp(`\\b(${this.escapeRegex(item.word)})\\b`, "gi");
      rendered = rendered.replace(
        regex,
        `<mark class="${item.color} font-medium px-1.5 py-0.5 rounded border inline-block my-0.5">$1</mark>`
      );
    }

    return rendered;
  }

  /**
   * Replaces trigger words with professional, high-converting synonyms without deleting any content.
   */
  public static autoFixSpamWordsWithSynonyms(text: string): string {
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

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
