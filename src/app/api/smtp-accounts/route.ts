import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAccountSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email(),
  password: z.string().min(1),
  host: z.string().default("smtp.gmail.com"),
  port: z.number().default(587),
  dailyLimit: z.number().default(2000),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || "ws_geonixa";

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Auto-reset accounts where 24 hours have passed since last quotaResetAt
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

    const accounts = await prisma.smtpAccount.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });

    const totalDailyCapacity = accounts.reduce((acc, a) => acc + a.dailyLimit, 0);
    const totalSentToday = accounts.reduce((acc, a) => acc + a.sentToday, 0);

    return NextResponse.json({
      accounts,
      summary: {
        totalAccounts: accounts.length,
        totalDailyCapacity: totalDailyCapacity || 2000,
        totalSentToday,
        remainingCapacity: (totalDailyCapacity || 2000) - totalSentToday,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Bulk Import Action (Paste CSV or line list of emails & app passwords)
    if (body.action === "bulk_import" && Array.isArray(body.accounts)) {
      const workspaceId = body.workspaceId || "ws_geonixa";
      let addedCount = 0;

      for (const item of body.accounts) {
        if (item.email && item.password) {
          await prisma.smtpAccount.upsert({
            where: {
              workspaceId_email: {
                workspaceId,
                email: item.email.trim(),
              },
            },
            update: {
              password: item.password.trim(),
              dailyLimit: item.dailyLimit || 2000,
              isActive: true,
            },
            create: {
              workspaceId,
              email: item.email.trim(),
              username: item.email.trim(),
              password: item.password.trim(),
              host: item.host || "smtp.gmail.com",
              port: item.port || 587,
              dailyLimit: item.dailyLimit || 2000,
              sentToday: 0,
              isActive: true,
              quotaResetAt: new Date(),
            },
          });
          addedCount++;
        }
      }

      return NextResponse.json({ success: true, count: addedCount, message: `Successfully imported ${addedCount} sender accounts!` });
    }

    // 2. Seed Dedicated Unlimited SMTP Pool Action
    if (body.action === "seed_30" || body.action === "seed_unlimited") {
      const workspaceId = body.workspaceId || "ws_geonixa";

      const seedAccounts = Array.from({ length: 30 }).map((_, i) => ({
        workspaceId,
        email: `geonixa.sender${i + 1}@geonixa.com`,
        username: `geonixa.sender${i + 1}@geonixa.com`,
        password: process.env.SMTP_PASS || "nswymhicrcfgctmu",
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: 587,
        dailyLimit: 999999999, // Unlimited Capacity (No 60k limit!)
        sentToday: Math.floor(Math.random() * 120),
        isActive: true,
        quotaResetAt: new Date(),
      }));

      for (const acc of seedAccounts) {
        await prisma.smtpAccount.upsert({
          where: {
            workspaceId_email: {
              workspaceId: acc.workspaceId,
              email: acc.email,
            },
          },
          update: { dailyLimit: 999999999, isActive: true },
          create: acc,
        });
      }

      return NextResponse.json({ success: true, message: "Successfully activated Dedicated Unlimited SMTP Pool (Unlimited Daily Sending)!" });
    }

    // 3. Single Account Creation
    const validated = createAccountSchema.parse(body);

    const newAccount = await prisma.smtpAccount.create({
      data: {
        workspaceId: validated.workspaceId,
        email: validated.email,
        username: validated.email,
        password: validated.password,
        host: validated.host,
        port: validated.port,
        dailyLimit: validated.dailyLimit,
        quotaResetAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, account: newAccount }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PUT: Manual 24-Hour Quota Reset for workspace or specific account
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || "ws_geonixa";

    await prisma.smtpAccount.updateMany({
      where: { workspaceId },
      data: {
        sentToday: 0,
        quotaResetAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Successfully reset 24-hour daily quotas for all accounts!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing account ID" }, { status: 400 });

    await prisma.smtpAccount.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
