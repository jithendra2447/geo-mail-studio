import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DNSDomainVerifier } from "@/lib/dns/verifier";

const registerDomainSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  domain: z.string().min(3, "Valid domain name is required"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || "ws_geonixa";

    const domains = await prisma.domainVerification.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      workspaceId,
      domains,
    });
  } catch (error: any) {
    console.error("[GET /api/domains/verify Error]:", error);
    return NextResponse.json({ error: "Failed to fetch workspace domains" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerDomainSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid domain registration payload", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { workspaceId, domain } = validation.data;
    const cleanDomain = domain.toLowerCase().trim();

    // Generate 2048-bit RSA DKIM Keypair
    const { publicKey } = DNSDomainVerifier.generateDKIMKeyPair();

    const record = await prisma.domainVerification.upsert({
      where: {
        workspaceId_domain: { workspaceId, domain: cleanDomain },
      },
      update: {
        dkimPublicKey: publicKey,
      },
      create: {
        workspaceId,
        domain: cleanDomain,
        dkimSelector: "geo1",
        dkimPublicKey: publicKey,
      },
    });

    const expectedRecords = {
      spf: {
        type: "TXT",
        host: "@",
        value: "v=spf1 ip4:YOUR_SERVER_IP ~all",
      },
      dkim: {
        type: "TXT",
        host: `geo1._domainkey.${cleanDomain}`,
        value: `v=DKIM1; k=rsa; p=${publicKey}`,
      },
      dmarc: {
        type: "TXT",
        host: `_dmarc.${cleanDomain}`,
        value: "v=DMARC1; p=quarantine; pct=100;",
      },
    };

    return NextResponse.json(
      {
        success: true,
        message: `Domain '${cleanDomain}' registered for verification. Please publish the required TXT records to your DNS provider.`,
        domainRecord: record,
        expectedRecords,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/domains/verify Error]:", error);
    return NextResponse.json({ error: "Failed to register domain for verification" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, domain } = body;

    if (!workspaceId || !domain) {
      return NextResponse.json({ error: "workspaceId and domain are required" }, { status: 400 });
    }

    const cleanDomain = domain.toLowerCase().trim();

    // Fetch domain record from DB
    const existing = await prisma.domainVerification.findUnique({
      where: { workspaceId_domain: { workspaceId, domain: cleanDomain } },
    });

    const selector = existing?.dkimSelector || "geo1";

    // Run Real Live DNS Resolution Check
    const dnsResult = await DNSDomainVerifier.verifyDomain(cleanDomain, selector);

    // Update DB record with live DNS results
    const updated = await prisma.domainVerification.update({
      where: { workspaceId_domain: { workspaceId, domain: cleanDomain } },
      data: {
        spfVerified: dnsResult.spfVerified,
        dkimVerified: dnsResult.dkimVerified,
        dmarcVerified: dnsResult.dmarcVerified,
        isVerified: dnsResult.isFullyVerified,
        verifiedAt: dnsResult.isFullyVerified ? new Date() : null,
      },
    });

    // If verified, update workspace authenticated domain
    if (dnsResult.isFullyVerified) {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { authenticatedDomain: cleanDomain },
      });
    }

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      isFullyVerified: dnsResult.isFullyVerified,
      status: updated,
      dnsDetails: dnsResult.details,
    });
  } catch (error: any) {
    console.error("[PUT /api/domains/verify Error]:", error);
    return NextResponse.json({ error: "Failed to perform live DNS verification check" }, { status: 500 });
  }
}
