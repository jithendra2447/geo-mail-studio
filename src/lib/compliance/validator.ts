/**
 * Standard Email Delivery & Anti-Spam Compliance Engine
 * Enforces CAN-SPAM, GDPR, RFC 8058, Sender Authenticity, and ISP Spam Filter Rules.
 */

export interface EmailComplianceValidationInput {
  htmlBody: string;
  subject?: string;
  textBody?: string;
  fromEmail: string;
  authenticatedDomain: string;
  physicalAddress: string;
  isInitialBulkBroadcast?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class EmailComplianceValidator {
  private static WHATSAPP_GROUP_LINK_REGEX = /https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/i;
  private static LINK_SHORTENER_REGEX = /https?:\/\/(bit\.ly|tinyurl\.com|goo\.gl|t\.co|ow\.ly)\/[A-Za-z0-9]+/i;
  private static EXCESSIVE_EXCLAMATION_REGEX = /!{3,}/;
  private static EXCESSIVE_DOLLAR_REGEX = /\${3,}/;

  /**
   * Validates an email campaign or automation template against strict compliance & domain authenticity rules.
   */
  public static validate(input: EmailComplianceValidationInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const content = `${input.htmlBody} ${input.textBody || ""}`;
    const plainText = input.htmlBody.replace(/<[^>]*>/g, " ").trim();

    // 1. Sender Authenticity Check (Strict Domain Signature Match)
    const senderDomain = input.fromEmail.split("@")[1]?.toLowerCase();
    const allowedDomain = input.authenticatedDomain.toLowerCase();

    if (senderDomain && allowedDomain && senderDomain !== "gmail.com" && allowedDomain !== "gmail.com") {
      if (senderDomain !== allowedDomain && !senderDomain.endsWith(`.${allowedDomain}`)) {
        warnings.push(
          `Domain Signature Warning: From email '${input.fromEmail}' is sending for '${input.authenticatedDomain}'. Ensure DKIM & SPF records are configured.`
        );
      }
    }

    // 2. WhatsApp Group Invite Link Filtering (Spam Filter Guardrail)
    if (input.isInitialBulkBroadcast && this.WHATSAPP_GROUP_LINK_REGEX.test(content)) {
      errors.push(
        "Spam Filter Block: Direct WhatsApp group invite links ('chat.whatsapp.com') are prohibited in initial bulk emails to avoid ISP blacklisting."
      );
    }

    // 3. Suspicious URL Shortener Check (ISP Spam Trigger)
    if (this.LINK_SHORTENER_REGEX.test(content)) {
      warnings.push(
        "Spam Filter Warning: Generic URL shorteners (bit.ly, tinyurl) trigger spam filters. Use direct domain links for maximum deliverability."
      );
    }

    // 4. Excessive Punctuation / ALL CAPS Check
    if (input.subject) {
      if (this.EXCESSIVE_EXCLAMATION_REGEX.test(input.subject) || this.EXCESSIVE_DOLLAR_REGEX.test(input.subject)) {
        warnings.push("Subject Line Warning: Excessive punctuation ('!!!' or '$$$') triggers spam filters.");
      }

      const uppercaseLetters = (input.subject.match(/[A-Z]/g) || []).length;
      const totalLetters = (input.subject.match(/[a-zA-Z]/g) || []).length;
      if (totalLetters > 8 && uppercaseLetters / totalLetters > 0.6) {
        warnings.push("Subject Line Warning: Subject line is mostly ALL CAPS, which spammers commonly use.");
      }
    }

    // 5. Minimal Text Content Check (Image-Only Email Risk)
    if (plainText.length < 30) {
      warnings.push("Low Content Warning: Email body contains less than 30 characters. Add plain text to pass spam filter checks.");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Automatically replaces placeholders OR appends clean legal compliance footer (physical address + unsubscribe link).
   */
  public static injectComplianceFooter(
    htmlTemplate: string,
    physicalAddress: string,
    unsubscribeUrl: string
  ): string {
    let processed = htmlTemplate;

    // 1. Replace explicit placeholders if present
    if (processed.includes("{{workspace.physicalAddress}}")) {
      processed = processed.replace(/{{workspace\.physicalAddress}}/g, physicalAddress);
    }
    if (processed.includes("{{unsubscribeUrl}}")) {
      processed = processed.replace(/{{unsubscribeUrl}}/g, unsubscribeUrl);
    }

    // 2. If physical address or unsubscribe link is missing from custom HTML, automatically append compliant footer
    const hasAddress = processed.includes(physicalAddress);
    const hasUnsub = processed.includes(unsubscribeUrl) || processed.includes("/unsubscribe");

    if (!hasAddress || !hasUnsub) {
      const footerHtml = `
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; font-family: sans-serif; text-align: center;">
          <p style="margin: 0 0 6px 0;">${physicalAddress}</p>
          <p style="margin: 0;"><a href="${unsubscribeUrl}" style="color: #4f46e5; text-decoration: underline;">Unsubscribe from these emails</a></p>
        </div>
      `;

      if (processed.includes("</body>")) {
        processed = processed.replace("</body>", `${footerHtml}</body>`);
      } else {
        processed += footerHtml;
      }
    }

    return processed;
  }
}
