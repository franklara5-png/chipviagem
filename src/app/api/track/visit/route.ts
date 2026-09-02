import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { siteVisits } from "@/db/schema";
import { getClientIp, getLocationFromHeaders } from "@/lib/geo";
import { isMachineVisit, isTrackablePath } from "@/lib/visit-tracking";

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

    if (!isTrackablePath(body.path)) {
      return NextResponse.json({ ok: true });
    }

    const userAgent = request.headers.get("user-agent");
    const ip = getClientIp(request);
    const location = getLocationFromHeaders(request);

    // IP privado, rastreador conhecido, cidade-datacenter ou estrangeiro sem
    // cidade: máquina, não visitante. Descartar aqui em vez de gravar e
    // filtrar depois mantém o card "IPs do dia" com gente de verdade.
    if (
      isMachineVisit({
        ip,
        userAgent,
        city: location.city,
        region: location.region,
        country: location.country,
      })
    ) {
      return NextResponse.json({ ok: true });
    }

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
