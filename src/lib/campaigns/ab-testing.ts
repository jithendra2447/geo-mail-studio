export interface ABVariant {
  id: "A" | "B";
  subject: string;
  bodyHtml: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
}

export interface ABTestExperiment {
  id: string;
  name: string;
  samplePercentage: number; // e.g. 10%
  variantA: ABVariant;
  variantB: ABVariant;
  winnerMetric: "OPEN_RATE" | "CLICK_RATE";
  winningVariant?: "A" | "B";
  status: "TESTING" | "COMPLETED";
}

export class ABTestingEngine {
  /**
   * Split recipient list into sample group and remaining group
   */
  public static splitRecipients<T>(
    recipients: T[],
    samplePercentage: number = 10
  ): { sample: T[]; remaining: T[] } {
    const total = recipients.length;
    const sampleSize = Math.max(2, Math.round((total * samplePercentage) / 100));

    return {
      sample: recipients.slice(0, sampleSize),
      remaining: recipients.slice(sampleSize),
    };
  }

  /**
   * Determine winning variant from test experiment metrics
   */
  public static determineWinner(experiment: ABTestExperiment): "A" | "B" {
    const rateA =
      experiment.winnerMetric === "OPEN_RATE"
        ? experiment.variantA.sentCount > 0
          ? experiment.variantA.openCount / experiment.variantA.sentCount
          : 0
        : experiment.variantA.sentCount > 0
        ? experiment.variantA.clickCount / experiment.variantA.sentCount
        : 0;

    const rateB =
      experiment.winnerMetric === "OPEN_RATE"
        ? experiment.variantB.sentCount > 0
          ? experiment.variantB.openCount / experiment.variantB.sentCount
          : 0
        : experiment.variantB.sentCount > 0
        ? experiment.variantB.clickCount / experiment.variantB.sentCount
        : 0;

    return rateA >= rateB ? "A" : "B";
  }
}
