import { NextRequest, NextResponse } from "next/server";
import { runExchangeRateCron } from "@/lib/margin-sync";
import { runReviewRequestCron } from "@/lib/reviews";
import { verifyCronSecret } from "@/lib/cron-auth";

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const exchange = await runExchangeRateCron();
    const reviews = await runReviewRequestCron();
    return NextResponse.json({ ok: true, exchange, reviews });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    console.error("[cron/exchange-rate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
