export interface DripStep {
  stepNumber: number;
  delayDays: number;
  subject: string;
  bodyHtml: string;
  condition: "ALWAYS" | "IF_NO_OPEN" | "IF_NO_CLICK" | "IF_NO_REPLY";
}

export interface DripSequence {
  id: string;
  name: string;
  workspaceId: string;
  steps: DripStep[];
  activeSubscribersCount: number;
  status: "ACTIVE" | "PAUSED" | "DRAFT";
}

export class DripEngine {
  /**
   * Evaluate whether a drip step should be sent based on subscriber activity history
   */
  public static shouldSendStep(
    step: DripStep,
    activityHistory: { hasOpened: boolean; hasClicked: boolean; hasReplied: boolean }
  ): boolean {
    switch (step.condition) {
      case "ALWAYS":
        return true;
      case "IF_NO_OPEN":
        return !activityHistory.hasOpened;
      case "IF_NO_CLICK":
        return !activityHistory.hasClicked;
      case "IF_NO_REPLY":
        return !activityHistory.hasReplied;
      default:
        return true;
    }
  }

  /**
   * Helper to build a standard 3-step Cold Email Drip Sequence
   */
  public static createDefaultSequence(name: string, workspaceId: string): DripSequence {
    return {
      id: `seq_${Date.now()}`,
      name,
      workspaceId,
      status: "ACTIVE",
      activeSubscribersCount: 0,
      steps: [
        {
          stepNumber: 1,
          delayDays: 0,
          subject: "Initial Pitch: Web Development Masterclass",
          bodyHtml: "<p>Hi {{subscriber.firstName}}, welcome to Eonixa...</p>",
          condition: "ALWAYS",
        },
        {
          stepNumber: 2,
          delayDays: 3,
          subject: "Re: Quick question about your web projects",
          bodyHtml: "<p>Hi {{subscriber.firstName}}, following up on my previous note...</p>",
          condition: "IF_NO_REPLY",
        },
        {
          stepNumber: 3,
          delayDays: 5,
          subject: "Final call: Eonixa cohort closing tomorrow",
          bodyHtml: "<p>Hi {{subscriber.firstName}}, seats are almost full...</p>",
          condition: "IF_NO_OPEN",
        },
      ],
    };
  }
}
