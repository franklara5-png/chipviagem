import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { siteVisits } from "@/db/schema";
import { getClientIp, getLocationFromHeaders } from "@/lib/geo";
import { isBotUserAgent, isTrackablePath } from "@/lib/visit-tracking";

export const dynamic = "force-dynamic";

const schema = z.object({
  path: z.string().max(500),
});

/**
 * Registra uma visita (Hermes / dashboard-frank). Cada chamada é um INSERT —
 * sem upsert; a agregação "1 IP = 1 linha" acontece só na leitura, em
 * /api/hermes/stats (GROUP BY ip).
 */
export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());

    const userAgent = request.headers.get("user-agent");
    if (isBotUserAgent(userAgent)) {
      return NextResponse.json({ ok: true });
    }
    if (!isTrackablePath(body.path)) {
      return NextResponse.json({ ok: true });
    }

    const ip = getClientIp(request);
    const location = getLocationFromHeaders(request);
    const referrer = request.headers.get("referer") || request.headers.get("referrer");

    await db.insert(siteVisits).values({
      ip,
      path: body.path,
      referrer: referrer || null,
      userAgent: userAgent || null,
      country: location.country ?? null,
      region: location.region ?? null,
      city: location.city ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Nunca deve quebrar a navegação do visitante por causa do tracking.
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
