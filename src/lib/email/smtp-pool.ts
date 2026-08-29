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
   * Prioritizes valid real environment credentials for actual inbox delivery.
   */
  public static async dispatchEmail(options: SmtpDispatchOptions) {
    const { workspaceId, to, subject, html, fromName = "GEO Mail Studio", delayMs = 300 } = options;

    const realUser = process.env.SMTP_USER || "jithendravarma.l@gmail.com";
    const realPass = process.env.SMTP_PASS || "nswymhicrcfgctmu";
    const realHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const realPort = Number(process.env.SMTP_PORT) || 587;

    // Check if there is a custom dedicated VPS account configured in DB
    const customSmtp = await prisma.smtpAccount.findFirst({
      where: {
        workspaceId,
        isActive: true,
        NOT: {
          email: {
            contains: "geonixa.sender",
          },
        },
      },
    });

    const activeUser = customSmtp ? customSmtp.username : realUser;
    const activePass = customSmtp ? customSmtp.password : realPass;
    const activeHost = customSmtp ? customSmtp.host : realHost;
    const activePort = customSmtp ? customSmtp.port : realPort;
    const activeFromEmail = customSmtp ? customSmtp.email : realUser;

    const transporter = nodemailer.createTransport({
      host: activeHost,
      port: activePort,
      secure: activePort === 465,
      auth: {
        user: activeUser,
        pass: activePass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
    });

    const mailOptions = {
      from: `"${fromName}" <${activeFromEmail}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[REAL SMTP DISPATCH SUCCESS]: Sent to ${to} via ${activeFromEmail}. MessageId: ${info.messageId}`);

    // Update sent counter for workspace
    await prisma.smtpAccount.updateMany({
      where: { workspaceId },
      data: { sentToday: { increment: 1 } },
    });

    return {
      success: true,
      messageId: info.messageId,
      senderUsed: activeFromEmail,
    };
  }
}
