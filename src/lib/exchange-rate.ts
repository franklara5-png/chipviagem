import { db } from "@/db";
import { exchangeRates } from "@/db/schema";
import { desc } from "drizzle-orm";

const AWESOME_API_URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL";

interface AwesomeApiResponse {
  USDBRL?: { bid: string; ask: string };
}

export async function fetchUsdBrlRate(): Promise<{ rate: number; source: string }> {
  const res = await fetch(AWESOME_API_URL, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`AwesomeAPI HTTP ${res.status}`);

  const data = (await res.json()) as AwesomeApiResponse;
  const bid = data.USDBRL?.bid;
  if (!bid) throw new Error("Resposta AwesomeAPI inválida");

  const rate = parseFloat(bid);
  if (isNaN(rate) || rate <= 0) throw new Error("Cotação inválida");

  return { rate, source: "awesomeapi" };
}

export async function saveExchangeRate(rate: number, source: string) {
  const [row] = await db
    .insert(exchangeRates)
    .values({ rate: rate.toFixed(4), source })
    .returning();

  await import("@/lib/settings").then(({ setSetting }) =>
    setSetting("usd_brl_rate", rate.toFixed(4))
  );

  return row;
}

export async function getLatestExchangeRate(): Promise<number> {
  const [latest] = await db
    .select()
    .from(exchangeRates)
    .orderBy(desc(exchangeRates.fetchedAt))
    .limit(1);

  if (latest) return parseFloat(latest.rate);

  const { getSetting } = await import("@/lib/settings");
  return parseFloat(await getSetting("usd_brl_rate"));
}

export async function fetchAndSaveExchangeRate(): Promise<{
  rate: number;
  source: string;
  fromCache: boolean;
}> {
  try {
    const { rate, source } = await fetchUsdBrlRate();
    await saveExchangeRate(rate, source);
    return { rate, source, fromCache: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[exchange-rate] Falha ao buscar cotação:", message);

    const cached = await getLatestExchangeRate();
    return { rate: cached, source: "cache", fromCache: true };
  }
}
