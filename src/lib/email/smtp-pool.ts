import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export interface SmtpDispatchOptions {
  workspaceId: string;
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  delayMs?: number;
}

export class SmtpPoolManager {
  /**
   * Dispatches an email using real SMTP transport.
   * Prioritizes valid real Gmail credentials for 100% actual inbox delivery.
   */
  public static async dispatchEmail(options: SmtpDispatchOptions) {
    const { workspaceId, to, subject, html, fromName = "GEO Mail Studio", delayMs = 300 } = options;

    const realUser = "jithendravarma.l@gmail.com";
    const realPass = "nswymhicrcfgctmu";
    const realHost = "smtp.gmail.com";
    const realPort = 587;

    const transporter = nodemailer.createTransport({
      host: realHost,
      port: realPort,
      secure: false,
      auth: {
        user: realUser,
        pass: realPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
    });

    const mailOptions = {
      from: `"${fromName}" <${realUser}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[REAL GMAIL SMTP DISPATCH SUCCESS]: Sent to ${to} via ${realUser}. MessageId: ${info.messageId}`);

    // Update sent counter for workspace
    await prisma.smtpAccount.updateMany({
      where: { workspaceId },
      data: { sentToday: { increment: 1 } },
    });

    return {
      success: true,
      messageId: info.messageId,
      senderUsed: realUser,
    };
  }
}
