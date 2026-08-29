import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export interface SmtpDispatchOptions {
  workspaceId: string;
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  delayMs?: number; // Delay between dispatches to prevent spam detection
}

export class SmtpPoolManager {
  /**
   * Dispatches an email using the multi-account load balancer pool.
   * Rotates through available SMTP sender accounts that have remaining daily capacity.
   * Automatically resets daily counters after 24 hours have elapsed.
   */
  public static async dispatchEmail(options: SmtpDispatchOptions) {
    const { workspaceId, to, subject, html, fromName = "GEO Mail Studio", delayMs = 600 } = options;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Check for any accounts that hit their 24h reset window and automatically reset sentToday = 0
    await prisma.smtpAccount.updateMany({
      where: {
        workspaceId,
        quotaResetAt: {
          lt: twentyFourHoursAgo,
        },
      },
      data: {
        sentToday: 0,
        quotaResetAt: now,
      },
    });

    // 2. Fetch active SMTP accounts for this workspace from DB
    const activeAccounts = await prisma.smtpAccount.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
      orderBy: {
        sentToday: "asc", // Pick least-used account first (Load Balancing)
      },
    });

    let selectedAccount: {
      email: string;
      host: string;
      port: number;
      username: string;
      password: string;
      sentToday: number;
      dailyLimit: number;
      id?: string;
    } | null = null;

    // Filter accounts with remaining daily quota (< dailyLimit)
    const availableAccount = activeAccounts.find((acc) => acc.sentToday < acc.dailyLimit);

    if (availableAccount) {
      selectedAccount = availableAccount;
    } else {
      // Fallback to primary env SMTP if pool empty or all 30 accounts exhausted for 24h
      selectedAccount = {
        email: process.env.SMTP_USER || "jithendravarma.l@gmail.com",
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        username: process.env.SMTP_USER || "jithendravarma.l@gmail.com",
        password: process.env.SMTP_PASS || "nswymhicrcfgctmu",
        sentToday: 0,
        dailyLimit: 2000,
      };
    }

    // 3. Configure Nodemailer transport for selected account
    const transporter = nodemailer.createTransport({
      host: selectedAccount.host,
      port: selectedAccount.port,
      secure: selectedAccount.port === 465,
      auth: {
        user: selectedAccount.username,
        pass: selectedAccount.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
    });

    const mailOptions = {
      from: `"${fromName}" <${selectedAccount.email}>`,
      to,
      subject,
      html,
    };

    // 4. Inject inter-email rate-limiting delay for spam prevention
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // 5. Send email via SMTP
    const info = await transporter.sendMail(mailOptions);

    // 6. Update sentToday counter for the selected account in DB
    if (selectedAccount.id) {
      await prisma.smtpAccount.update({
        where: { id: selectedAccount.id },
        data: {
          sentToday: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });
    }

    return {
      messageId: info.messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderUsed: selectedAccount.email,
      response: info.response,
    };
  }

  /**
   * Manually resets 24-hour daily counters for all accounts in workspace.
   */
  public static async resetDailyCounters(workspaceId: string) {
    await prisma.smtpAccount.updateMany({
      where: { workspaceId },
      data: {
        sentToday: 0,
        quotaResetAt: new Date(),
      },
    });
  }
}
