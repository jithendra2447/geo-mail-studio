import { Resend } from "resend";
import { EmailComplianceValidator, EmailComplianceValidationInput } from "@/lib/compliance/validator";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key_for_dev");

export interface SendEmailPayload {
  workspaceId: string;
  fromName: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  authenticatedDomain?: string;
  physicalAddress?: string;
  unsubscribeUrl?: string;
  isInitialBulkBroadcast?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  complianceErrors?: string[];
  mockSent?: boolean;
}

export class EmailSenderService {
  /**
   * Programmatically validates anti-spam compliance & sends outbound email via Resend.
   */
  public static async sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
    const authenticatedDomain = payload.authenticatedDomain || process.env.DEFAULT_SENDING_DOMAIN || "geonixa.com";
    const physicalAddress = payload.physicalAddress || "123 Technology Park, Suite 500, San Francisco CA 94107";
    const unsubscribeUrl = payload.unsubscribeUrl || `https://${authenticatedDomain}/unsubscribe?email=${encodeURIComponent(payload.toEmail)}&ws=${payload.workspaceId}`;

    // 1. Programmatic Anti-Spam & Domain Authenticity Validation
    const validationInput: EmailComplianceValidationInput = {
      fromEmail: payload.fromEmail,
      authenticatedDomain,
      physicalAddress,
      htmlBody: payload.htmlBody,
      textBody: payload.textBody,
      isInitialBulkBroadcast: payload.isInitialBulkBroadcast,
    };

    const complianceResult = EmailComplianceValidator.validate(validationInput);

    if (!complianceResult.isValid) {
      return {
        success: false,
        error: "Email blocked by Anti-Spam & Sender Authenticity Compliance Engine.",
        complianceErrors: complianceResult.errors,
      };
    }

    // 2. Inject Compliance Footer (Physical Address + Unsubscribe Link)
    const finalHtml = EmailComplianceValidator.injectComplianceFooter(
      payload.htmlBody,
      physicalAddress,
      unsubscribeUrl
    );

    const fromFormatted = `${payload.fromName} <${payload.fromEmail}>`;

    // 3. Handle Development / Mock API Key graceful fallback
    const apiKey = process.env.RESEND_API_KEY || "";
    if (!apiKey || apiKey === "re_123456789_example_key" || apiKey === "re_mock_key_for_dev") {
      console.log(`[EmailSender Simulated Send]: To: ${payload.toEmail} | From: ${fromFormatted} | Subject: ${payload.subject}`);
      return {
        success: true,
        messageId: `mock_msg_${Date.now()}`,
        mockSent: true,
      };
    }

    // 4. Send via Resend API
    try {
      const response = await resend.emails.send({
        from: fromFormatted,
        to: [payload.toEmail],
        subject: payload.subject,
        html: finalHtml,
        text: payload.textBody,
      });

      if (response.error) {
        return {
          success: false,
          error: response.error.message,
        };
      }

      return {
        success: true,
        messageId: response.data?.id,
      };
    } catch (err: any) {
      console.error("[Resend API Error]:", err);
      return {
        success: false,
        error: err.message || "Failed to dispatch email",
      };
    }
  }
}
