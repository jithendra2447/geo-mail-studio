import crypto from "crypto";

export interface TrackedOpenEvent {
  messageId: string;
  toEmail: string;
  campaignId: string;
  openedAt: string;
  userAgent?: string;
  ipAddress?: string;
  deviceType: "Mobile" | "Desktop" | "Tablet" | "Unknown";
}

export interface TrackedClickEvent {
  messageId: string;
  targetUrl: string;
  campaignId: string;
  clickedAt: string;
  userAgent?: string;
  ipAddress?: string;
}

export class PixelTracker {
  // 1x1 Transparent GIF base64 byte array
  private static TRANSPARENT_GIF_BUFFER = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  /**
   * Get 1x1 transparent GIF buffer for open tracking pixel API
   */
  public static getTransparentGifBuffer(): Buffer {
    return this.TRANSPARENT_GIF_BUFFER;
  }

  /**
   * Inject 1x1 open tracking pixel tag into HTML body before </body>
   */
  public static injectTrackingPixel(
    htmlBody: string,
    messageId: string,
    campaignId: string,
    baseUrl: string = "http://localhost:3000"
  ): string {
    const pixelUrl = `${baseUrl}/api/track/open?msgId=${encodeURIComponent(
      messageId
    )}&cid=${encodeURIComponent(campaignId)}`;
    const pixelTag = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none !important; width:1px; height:1px; border:0; opacity:0;" />`;

    if (htmlBody.includes("</body>")) {
      return htmlBody.replace("</body>", `${pixelTag}</body>`);
    }

    return `${htmlBody}${pixelTag}`;
  }

  /**
   * Wrap links inside email HTML for click tracking
   */
  public static wrapClickLinks(
    htmlBody: string,
    messageId: string,
    campaignId: string,
    baseUrl: string = "http://localhost:3000"
  ): string {
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["']/gi;

    return htmlBody.replace(linkRegex, (match, originalUrl) => {
      if (originalUrl.startsWith("mailto:") || originalUrl.startsWith("#") || originalUrl.includes("/api/unsubscribe")) {
        return match;
      }

      const trackedClickUrl = `${baseUrl}/api/track/click?url=${encodeURIComponent(
        originalUrl
      )}&msgId=${encodeURIComponent(messageId)}&cid=${encodeURIComponent(campaignId)}`;

      return match.replace(originalUrl, trackedClickUrl);
    });
  }

  /**
   * Simple user-agent parser for device detection
   */
  public static parseDeviceType(userAgent: string = ""): "Mobile" | "Desktop" | "Tablet" | "Unknown" {
    const ua = userAgent.toLowerCase();
    if (!ua) return "Unknown";

    if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "Tablet";
    if (/iphone|ipod|android|blackberry|opera mini|windows phone/i.test(ua)) return "Mobile";
    if (/macintosh|windows|linux|cros/i.test(ua)) return "Desktop";

    return "Unknown";
  }
}
