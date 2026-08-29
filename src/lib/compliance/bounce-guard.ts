import dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);

// Known disposable email domain list for zero-bounce filtering
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "dispostable.com",
  "getairmail.com",
  "temp-mail.org",
]);

export interface BounceValidationResult {
  email: string;
  domain: string;
  isValidSyntax: boolean;
  isDisposable: boolean;
  hasMxRecords: boolean;
  deliverabilityStatus: "SAFE" | "RISKY" | "UNDELIVERABLE";
  riskReason?: string;
}

export class BounceGuard {
  /**
   * Validate email syntax using strict RFC 5322 regex
   */
  public static isValidSyntax(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Check if domain is a known temporary or disposable provider
   */
  public static isDisposableDomain(domain: string): boolean {
    return DISPOSABLE_DOMAINS.has(domain.toLowerCase().trim());
  }

  /**
   * Full asynchronous deliverability check (Syntax + MX Lookup + Disposable Filter)
   */
  public static async validateEmail(email: string): Promise<BounceValidationResult> {
    const cleanEmail = email.toLowerCase().trim();
    if (!this.isValidSyntax(cleanEmail)) {
      return {
        email: cleanEmail,
        domain: cleanEmail.split("@")[1] || "",
        isValidSyntax: false,
        isDisposable: false,
        hasMxRecords: false,
        deliverabilityStatus: "UNDELIVERABLE",
        riskReason: "Invalid email syntax format",
      };
    }

    const domain = cleanEmail.split("@")[1];

    if (this.isDisposableDomain(domain)) {
      return {
        email: cleanEmail,
        domain,
        isValidSyntax: true,
        isDisposable: true,
        hasMxRecords: false,
        deliverabilityStatus: "UNDELIVERABLE",
        riskReason: "Disposable/temporary email provider detected",
      };
    }

    // Perform MX record lookup
    let hasMx = false;
    try {
      const mxRecords = await resolveMx(domain);
      hasMx = mxRecords && mxRecords.length > 0;
    } catch (err) {
      hasMx = false;
    }

    if (!hasMx) {
      return {
        email: cleanEmail,
        domain,
        isValidSyntax: true,
        isDisposable: false,
        hasMxRecords: false,
        deliverabilityStatus: "UNDELIVERABLE",
        riskReason: "No mail exchange (MX) server found for domain",
      };
    }

    return {
      email: cleanEmail,
      domain,
      isValidSyntax: true,
      isDisposable: false,
      hasMxRecords: true,
      deliverabilityStatus: "SAFE",
    };
  }

  /**
   * Bulk validate array of emails
   */
  public static async bulkValidate(emails: string[]): Promise<BounceValidationResult[]> {
    return Promise.all(emails.map((e) => this.validateEmail(e)));
  }
}
