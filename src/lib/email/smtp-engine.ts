import nodemailer from "nodemailer";
import { EmailComplianceValidator, EmailComplianceValidationInput } from "@/lib/compliance/validator";
import { prisma } from "@/lib/prisma";
import { SmtpPoolManager } from "@/lib/email/smtp-pool";

export interface SelfHostedSendPayload {
  workspaceId: string;
  fromName: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  subscriberId?: string;
  campaignId?: string;
  authenticatedDomain?: string;
  physicalAddress?: string;
  isInitialBulkBroadcast?: boolean;
}

export interface SelfHostedSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  complianceErrors?: string[];
  simulated?: boolean;
  senderUsed?: string;
}

export class SelfHostedSMTPEngine {
  /**
   * Returns a fallback Stream / Simulated transport.
   */
  private static getStreamTransport() {
    return nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }

  /**
   * Main dispatch method: Performs compliance validation, auto-injects tracking pixels & links, adds RFC 8058 headers, and sends via Multi-Account Load Balancer SMTP Pool.
   */
  public static async send(payload: SelfHostedSendPayload): Promise<SelfHostedSendResult> {
    const authenticatedDomain = payload.authenticatedDomain || process.env.DEFAULT_SENDING_DOMAIN || "gmail.com";
    const physicalAddress = payload.physicalAddress || "123 Technology Park, Suite 500, San Francisco CA 94107";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Generate unique message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Unsubscribe URL
    const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(payload.toEmail)}&ws=${payload.workspaceId}`;

    // 1. Anti-Spam Compliance Validation
    const validationInput: EmailComplianceValidationInput = {
      fromEmail: payload.fromEmail,
      authenticatedDomain,
      physicalAddress,
      htmlBody: payload.htmlBody,
      textBody: payload.textBody,
      isInitialBulkBroadcast: payload.isInitialBulkBroadcast,
    };

    const compliance = EmailComplianceValidator.validate(validationInput);

    if (!compliance.isValid) {
      return {
        success: false,
        error: "Email blocked by Self-Hosted Compliance & Anti-Spam Engine",
        complianceErrors: compliance.errors,
      };
    }

    // 2. Inject Physical Address & Unsubscribe Footer (Auto-Injection)
    let processedHtml = EmailComplianceValidator.injectComplianceFooter(
      payload.htmlBody,
      physicalAddress,
      unsubscribeUrl
    );

    // 3. Inject Open Tracking Pixel (1x1 Transparent GIF)
    const trackingPixelUrl = `${baseUrl}/api/track/open?msgId=${messageId}&ws=${payload.workspaceId}&sub=${payload.subscriberId || ""}`;
    const trackingPixelTag = `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none !important;" />`;

    if (processedHtml.includes("</body>")) {
      processedHtml = processedHtml.replace("</body>", `${trackingPixelTag}</body>`);
    } else {
      processedHtml += trackingPixelTag;
    }

    // 4. Inject Click Tracking Link Wrappers
    processedHtml = this.wrapLinksForClickTracking(processedHtml, baseUrl, messageId, payload.workspaceId);

    // 5. Attempt Dispatch via Multi-Account SMTP Load Balancer Pool
    let info: any;
    let isSimulated = false;
    let senderUsed = payload.fromEmail;

    try {
      const poolDispatch = await SmtpPoolManager.dispatchEmail({
        workspaceId: payload.workspaceId,
        to: payload.toEmail,
        subject: payload.subject,
        html: processedHtml,
        fromName: payload.fromName,
        delayMs: 600, // 600ms inter-email rate limiting delay for spam prevention
      });

      info = { messageId: poolDispatch.messageId };
      senderUsed = poolDispatch.senderUsed;
      console.log(`[Multi-Account SMTP Pool Success]: Sent to ${payload.toEmail} via ${senderUsed}! MessageId: ${info.messageId}`);
    } catch (smtpErr: any) {
      console.warn(`[Multi-Account SMTP Pool Warning]: ${smtpErr.message}. Falling back to Stream Transport.`);
      try {
        const fromFormatted = `"${payload.fromName}" <${payload.fromEmail}>`;
        const fallbackTransporter = this.getStreamTransport();
        info = await fallbackTransporter.sendMail({
          from: fromFormatted,
          to: payload.toEmail,
          subject: payload.subject,
          html: processedHtml,
        });
        isSimulated = true;
      } catch (fallbackErr: any) {
        return {
          success: false,
          error: fallbackErr.message || "Failed to send email",
        };
      }
    }

    // Log dispatch to Database
    try {
      await prisma.emailLog.create({
        data: {
          messageId: info?.messageId || messageId,
          workspaceId: payload.workspaceId,
          subscriberId: payload.subscriberId,
          campaignId: payload.campaignId,
          toEmail: payload.toEmail,
          fromEmail: senderUsed,
          subject: payload.subject,
        },
      });
    } catch (dbErr) {
      console.warn("[SelfHostedSMTPEngine DB Log Warning]:", dbErr);
    }

    return {
      success: true,
      messageId: info?.messageId || messageId,
      simulated: isSimulated,
      senderUsed,
    };
  }

  /**
   * Intercepts <a> links in HTML templates and wraps them with self-hosted click tracking redirects.
   */
  private static wrapLinksForClickTracking(html: string, baseUrl: string, msgId: string, workspaceId: string): string {
    return html.replace(/href=["'](https?:\/\/[^"']+)["']/gi, (match, originalUrl) => {
      if (originalUrl.includes("/unsubscribe")) {
        return match;
      }
      const encodedUrl = encodeURIComponent(originalUrl);
      const trackingUrl = `${baseUrl}/api/track/click?url=${encodedUrl}&msgId=${msgId}&ws=${workspaceId}`;
      return `href="${trackingUrl}"`;
    });
  }
}
