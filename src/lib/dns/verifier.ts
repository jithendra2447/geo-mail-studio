import dns from "dns/promises";
import crypto from "crypto";

export interface DNSCheckResult {
  domain: string;
  spfVerified: boolean;
  dkimVerified: boolean;
  dmarcVerified: boolean;
  isFullyVerified: boolean;
  spfRecordFound?: string;
  dkimRecordFound?: string;
  dmarcRecordFound?: string;
  details: {
    spfStatus: string;
    dkimStatus: string;
    dmarcStatus: string;
  };
}

export class DNSDomainVerifier {
  /**
   * Generates a 2048-bit RSA Public/Private Key pair for DKIM signing.
   */
  public static generateDKIMKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    // Strip PEM header/footer to extract raw base64 key string for TXT record p= parameter
    const cleanPublicKey = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/g, "")
      .replace(/-----END PUBLIC KEY-----/g, "")
      .replace(/\s+/g, "");

    return {
      publicKey: cleanPublicKey,
      privateKey,
    };
  }

  /**
   * Performs real-time live DNS TXT record lookups against public DNS servers.
   */
  public static async verifyDomain(domain: string, dkimSelector = "geo1"): Promise<DNSCheckResult> {
    const cleanDomain = domain.trim().toLowerCase();

    let spfVerified = false;
    let dkimVerified = false;
    let dmarcVerified = false;

    let spfRecordFound: string | undefined;
    let dkimRecordFound: string | undefined;
    let dmarcRecordFound: string | undefined;

    let spfStatus = "Missing or unconfigured";
    let dkimStatus = "Missing or unconfigured";
    let dmarcStatus = "Missing or unconfigured";

    // 1. Live SPF Record Verification (TXT lookup on domain)
    try {
      const txtRecords = await dns.resolveTxt(cleanDomain);
      const flattened = txtRecords.map((chunks) => chunks.join(""));
      const spfRecord = flattened.find((r) => r.startsWith("v=spf1"));

      if (spfRecord) {
        spfVerified = true;
        spfRecordFound = spfRecord;
        spfStatus = `Valid SPF Record Detected: ${spfRecord}`;
      } else {
        spfStatus = "No SPF record starting with 'v=spf1' was found on domain TXT records.";
      }
    } catch (err: any) {
      spfStatus = `DNS Lookup Error: ${err.message || "Domain TXT lookup failed"}`;
    }

    // 2. Live DKIM Record Verification (TXT lookup on {selector}._domainkey.domain)
    const dkimHost = `${dkimSelector}._domainkey.${cleanDomain}`;
    try {
      const txtRecords = await dns.resolveTxt(dkimHost);
      const flattened = txtRecords.map((chunks) => chunks.join(""));
      const dkimRecord = flattened.find((r) => r.includes("v=DKIM1") || r.includes("p="));

      if (dkimRecord) {
        dkimVerified = true;
        dkimRecordFound = dkimRecord;
        dkimStatus = `Valid DKIM Record Detected on ${dkimHost}`;
      } else {
        dkimStatus = `No TXT record containing 'v=DKIM1; p=...' found at ${dkimHost}`;
      }
    } catch (err: any) {
      dkimStatus = `DKIM DNS Lookup Error on ${dkimHost}: ${err.message || "Record not published yet"}`;
    }

    // 3. Live DMARC Record Verification (TXT lookup on _dmarc.domain)
    const dmarcHost = `_dmarc.${cleanDomain}`;
    try {
      const txtRecords = await dns.resolveTxt(dmarcHost);
      const flattened = txtRecords.map((chunks) => chunks.join(""));
      const dmarcRecord = flattened.find((r) => r.startsWith("v=DMARC1"));

      if (dmarcRecord) {
        dmarcVerified = true;
        dmarcRecordFound = dmarcRecord;
        dmarcStatus = `Valid DMARC Policy Detected: ${dmarcRecord}`;
      } else {
        dmarcStatus = `No TXT record starting with 'v=DMARC1' found at ${dmarcHost}`;
      }
    } catch (err: any) {
      dmarcStatus = `DMARC DNS Lookup Error on ${dmarcHost}: ${err.message || "Record not published yet"}`;
    }

    const isFullyVerified = spfVerified && dkimVerified;

    return {
      domain: cleanDomain,
      spfVerified,
      dkimVerified,
      dmarcVerified,
      isFullyVerified,
      spfRecordFound,
      dkimRecordFound,
      dmarcRecordFound,
      details: {
        spfStatus,
        dkimStatus,
        dmarcStatus,
      },
    };
  }
}
