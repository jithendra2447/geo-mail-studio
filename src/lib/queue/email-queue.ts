import { SmtpPoolManager } from "@/lib/email/smtp-pool";
import { prisma } from "@/lib/prisma";

export interface QueueJobPayload {
  jobId: string;
  workspaceId: string;
  campaignId: string;
  subscribers: { id: string; email: string; firstName?: string | null }[];
  subject: string;
  bodyHtml: string;
  fromName: string;
  fromEmail: string;
  delayMs?: number;
}

export interface JobProgress {
  jobId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentSender?: string;
  errors: string[];
}

// In-Memory & DB-Backed Background Queue Worker State
const activeJobs = new Map<string, JobProgress>();

export class BackgroundEmailQueue {
  /**
   * Submits a bulk campaign to the background queue worker.
   * Returns immediately with jobId so HTTP requests never time out!
   */
  public static async enqueueCampaign(payload: QueueJobPayload): Promise<JobProgress> {
    const { jobId, workspaceId, campaignId, subscribers, subject, bodyHtml, fromName, fromEmail, delayMs = 600 } = payload;

    const initialProgress: JobProgress = {
      jobId,
      status: "QUEUED",
      total: subscribers.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    };

    activeJobs.set(jobId, initialProgress);

    // Trigger async processing worker without awaiting (Non-Blocking background execution)
    this.processJob(payload).catch((err) => {
      console.error(`[Background Queue Fatal Job Error ${jobId}]:`, err);
    });

    return initialProgress;
  }

  /**
   * Background Worker execution loop: Rotates sender pool accounts & respects throttling delays.
   */
  private static async processJob(payload: QueueJobPayload) {
    const { jobId, workspaceId, campaignId, subscribers, subject, bodyHtml, fromName, delayMs = 600 } = payload;
    const progress = activeJobs.get(jobId);

    if (!progress) return;

    progress.status = "PROCESSING";

    for (const subscriber of subscribers) {
      try {
        // Interpolate tags
        const personalizedHtml = bodyHtml.replace(
          /{{subscriber\.firstName}}/g,
          subscriber.firstName || "Subscriber"
        );

        // Dispatch via Multi-Account SMTP Load Balancer
        const dispatch = await SmtpPoolManager.dispatchEmail({
          workspaceId,
          to: subscriber.email,
          subject,
          html: personalizedHtml,
          fromName,
          delayMs,
        });

        progress.processed++;
        progress.successful++;
        progress.currentSender = dispatch.senderUsed;

        // Log to DB
        try {
          await prisma.emailLog.create({
            data: {
              messageId: dispatch.messageId,
              workspaceId,
              subscriberId: subscriber.id,
              campaignId,
              toEmail: subscriber.email,
              fromEmail: dispatch.senderUsed,
              subject,
            },
          });
        } catch (dbErr) {
          console.warn("[Background Queue DB Log Warning]:", dbErr);
        }
      } catch (err: any) {
        progress.processed++;
        progress.failed++;
        progress.errors.push(`${subscriber.email}: ${err.message}`);
      }
    }

    progress.status = "COMPLETED";

    // Update Campaign Status in DB to SENT
    try {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });
    } catch (err) {
      console.warn("[Background Queue Campaign Status Update Warning]:", err);
    }
  }

  /**
   * Retrieves live status of a background job.
   */
  public static getJobStatus(jobId: string): JobProgress | undefined {
    return activeJobs.get(jobId);
  }
}
