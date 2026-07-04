import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEFAULTS: Record<string, string> = {
  default_margin_percent: "40",
  min_margin_percent: "25",
  auto_reprice_enabled: "false",
  usd_brl_rate: "5.50",
  support_email: "suporte@chipviagem.com.br",
};

export async function getSetting(key: string): Promise<string> {
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return row?.value ?? DEFAULTS[key] ?? "";
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  const result = { ...DEFAULTS };
  for (const row of rows) result[row.key] = row.value;
  return result;
}

export async function setSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export function calculateMarginPercent(retailBrl: number, wholesaleUsd: number, usdRate: number): number {
  const costBrl = wholesaleUsd * usdRate;
  if (costBrl === 0) return 0;
  return ((retailBrl - costBrl) / retailBrl) * 100;
}

export function suggestRetailPrice(wholesaleUsd: number, usdRate: number, marginPercent: number): number {
  const costBrl = wholesaleUsd * usdRate;
  return Math.ceil(costBrl / (1 - marginPercent / 100));
}
