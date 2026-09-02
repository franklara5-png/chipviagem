import { NextResponse } from "next/server";
import { authorizeHermes } from "@/lib/hermes-auth";
import { getHermesHistory } from "@/lib/history-stats";

export const dynamic = "force-dynamic";

/** Histórico mensal (12) e anual (5) para o dashboard interno (Hermes / dashboard-frank). */
export async function GET(req: Request) {
  if (!authorizeHermes(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await getHermesHistory();
  return NextResponse.json(history, { headers: { "Cache-Control": "no-store" } });
}
