import { NextResponse } from "next/server";
import { BounceGuard } from "@/lib/compliance/bounce-guard";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, emails } = body;

    if (emails && Array.isArray(emails)) {
      const results = await BounceGuard.bulkValidate(emails);
      return NextResponse.json({ success: true, count: results.length, results });
    }

    if (!email) {
      return NextResponse.json({ error: "Missing required 'email' or 'emails' parameter" }, { status: 400 });
    }

    const result = await BounceGuard.validateEmail(email);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
