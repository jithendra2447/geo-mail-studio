export interface SubscriberScore {
  email: string;
  score: number;
  tier: "COLD" | "WARM" | "HOT" | "VIP";
  opensCount: number;
  clicksCount: number;
  unsubscribed: boolean;
}

export class LeadScorer {
  /**
   * Calculate subscriber engagement score and classification tier
   */
  public static calculateScore(
    opensCount: number,
    clicksCount: number,
    unsubscribed: boolean = false
  ): SubscriberScore {
    if (unsubscribed) {
      return {
        email: "",
        score: 0,
        tier: "COLD",
        opensCount,
        clicksCount,
        unsubscribed: true,
      };
    }

    // Scoring weights: Opens = +5 pts, Clicks = +15 pts
    const score = opensCount * 5 + clicksCount * 15;

    let tier: "COLD" | "WARM" | "HOT" | "VIP" = "COLD";
    if (score >= 50) tier = "VIP";
    else if (score >= 25) tier = "HOT";
    else if (score >= 10) tier = "WARM";

    return {
      email: "",
      score,
      tier,
      opensCount,
      clicksCount,
      unsubscribed: false,
    };
  }
}
