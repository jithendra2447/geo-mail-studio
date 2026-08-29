import { NextResponse } from "next/server";
import { WarmupEngine } from "@/lib/warmup/warmup-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetVolume = Number(searchParams.get("targetVolume")) || 2000;
    const schedule = WarmupEngine.calculateWarmupSchedule(targetVolume);

    return NextResponse.json({
      success: true,
      warmupPeriodDays: 14,
      targetVolume,
      schedule,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderEmail, peerEmail } = body;

    if (!senderEmail || !peerEmail) {
      return NextResponse.json({ error: "senderEmail and peerEmail are required" }, { status: 400 });
    }

    const payload = WarmupEngine.generateWarmupPayload(senderEmail, peerEmail);
    return NextResponse.json({ success: true, payload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
