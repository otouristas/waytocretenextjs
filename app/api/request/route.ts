import { NextResponse } from "next/server";
import { sendRequestMail } from "@/lib/email/send-request-mail";
import type { RequestPayload } from "@/lib/request";

export async function POST(request: Request) {
  let payload: RequestPayload;
  try {
    payload = (await request.json()) as RequestPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!payload?.name || !payload?.email || !payload?.kind) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  const result = await sendRequestMail(payload);
  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      fallback: "mailto",
      to: result.to,
      subject: result.subject,
      body: result.body,
    });
  }
  return NextResponse.json({ ok: true });
}
