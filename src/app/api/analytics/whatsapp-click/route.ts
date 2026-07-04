import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trackAnalyticsEvent, WHATSAPP_CLICK_EVENT } from "@/lib/analytics";

const schema = z.object({
  path: z.string().max(500).default("/"),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    await trackAnalyticsEvent(WHATSAPP_CLICK_EVENT, body.path);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
