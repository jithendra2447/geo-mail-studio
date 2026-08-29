export interface WarmupScheduleDay {
  day: number;
  emailsPerDay: number;
  rampStatus: string;
}

export interface WarmupAccountState {
  accountId: string;
  email: string;
  startDate: string;
  currentDay: number;
  targetDailyVolume: number;
  sentToday: number;
  reputationScore: number; // 0 - 100
  status: "WARMING_UP" | "WARMED" | "PAUSED";
}

export class WarmupEngine {
  /**
   * Calculate 14-day gradual warmup schedule starting from 5 emails/day up to 2,000/day
   */
  public static calculateWarmupSchedule(targetVolume: number = 2000): WarmupScheduleDay[] {
    const schedule: WarmupScheduleDay[] = [];
    const initial = 5;
    const days = 14;
    const factor = Math.pow(targetVolume / initial, 1 / (days - 1));

    for (let i = 1; i <= days; i++) {
      const vol = Math.min(targetVolume, Math.round(initial * Math.pow(factor, i - 1)));
      let status = "Phase 1: Initial Handshake";
      if (i > 4 && i <= 9) status = "Phase 2: Volume Scaling";
      if (i > 9) status = "Phase 3: High Volume Warmup";

      schedule.push({
        day: i,
        emailsPerDay: vol,
        rampStatus: status,
      });
    }

    return schedule;
  }

  /**
   * Simulate a peer-to-peer warmup email payload
   */
  public static generateWarmupPayload(senderEmail: string, peerEmail: string) {
    const subjects = [
      "Quick sync on project roadmap",
      "Meeting notes follow up",
      "Draft schedule for next week",
      "Feedback on recent proposal",
      "Updated specs review",
    ];

    const bodies = [
      "Hi there, just reviewing the latest updates. Let me know if you need any adjustments.",
      "Thanks for sending over the details. I will review and get back to you shortly.",
      "Looks good to me. Appreciate the fast turnaround on this!",
      "Could you confirm if the schedule works for your team?",
    ];

    const randomSub = subjects[Math.floor(Math.random() * subjects.length)];
    const randomBody = bodies[Math.floor(Math.random() * bodies.length)];

    return {
      from: senderEmail,
      to: peerEmail,
      subject: `[Warmup] ${randomSub}`,
      body: `<p>${randomBody}</p><br/><p style="font-size:10px;color:#94a3b8;">GEO Mail Automated Peer Warmup</p>`,
    };
  }

  /**
   * Calculate sender reputation score (0 - 100) based on age and bounce rate
   */
  public static calculateReputationScore(
    currentDay: number,
    totalSent: number,
    bounces: number
  ): number {
    if (totalSent === 0) return 100;
    const bounceRate = bounces / totalSent;
    let score = 100;

    if (bounceRate > 0.05) score -= 40;
    else if (bounceRate > 0.02) score -= 20;

    const ageBonus = Math.min(20, currentDay * 1.5);
    score = Math.min(100, Math.max(0, Math.round(score - (bounceRate * 100) + ageBonus)));

    return score;
  }
}
