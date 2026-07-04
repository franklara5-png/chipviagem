import { NextRequest, NextResponse } from "next/server";
import { runExchangeRateCron } from "@/lib/margin-sync";

function verifyCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.warn("[cron] CRON_SECRET não configurado");
    return false;
  }
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const result = await runExchangeRateCron();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    console.error("[cron/exchange-rate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
