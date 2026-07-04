import { db } from "@/db";
import { plans, priceChanges } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getLatestExchangeRate } from "@/lib/exchange-rate";
import { sendMarginAlertEmail } from "@/lib/email";
import {
  calculateCurrentMarginPercent,
  getMarginStatus,
  suggestReprice,
} from "@/lib/margin";
import { getSetting } from "@/lib/settings";

export interface PlanMarginInfo {
  planId: string;
  planName: string;
  retailPriceBrl: number;
  wholesalePriceUsd: number;
  currentMargin: number;
  status: "green" | "yellow" | "red";
  suggestedPrice: number;
}

export async function recalculateAllPlanMargins(usdRate: number): Promise<PlanMarginInfo[]> {
  const minMargin = parseFloat(await getSetting("min_margin_percent"));
  const autoReprice = (await getSetting("auto_reprice_enabled")) === "true";

  const allPlans = await db.select().from(plans);
  const atRisk: PlanMarginInfo[] = [];

  for (const plan of allPlans) {
    const retail = parseFloat(plan.retailPriceBrl);
    const wholesale = parseFloat(plan.wholesalePriceUsd);
    const currentMargin = calculateCurrentMarginPercent(retail, wholesale, usdRate);
    const status = getMarginStatus(currentMargin, minMargin);
    const suggested = suggestReprice(retail, wholesale, usdRate, minMargin);

    await db
      .update(plans)
      .set({
        currentMarginPercent: currentMargin.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(plans.id, plan.id));

    if (status === "red") {
      const info: PlanMarginInfo = {
        planId: plan.id,
        planName: plan.name,
        retailPriceBrl: retail,
        wholesalePriceUsd: wholesale,
        currentMargin: currentMargin,
        status,
        suggestedPrice: suggested,
      };
      atRisk.push(info);

      if (autoReprice && suggested > retail) {
        await db
          .update(plans)
          .set({
            retailPriceBrl: suggested.toFixed(2),
            marginPercent: calculateCurrentMarginPercent(suggested, wholesale, usdRate).toFixed(2),
            currentMarginPercent: calculateCurrentMarginPercent(suggested, wholesale, usdRate).toFixed(2),
            updatedAt: new Date(),
          })
          .where(eq(plans.id, plan.id));

        await db.insert(priceChanges).values({
          planId: plan.id,
          oldPrice: retail.toFixed(2),
          newPrice: suggested.toFixed(2),
          reason: `Reajuste automático: margem abaixo de ${minMargin}% (cotação USD ${usdRate.toFixed(4)})`,
        });
      }
    }
  }

  return atRisk;
}

export async function runExchangeRateCron() {
  const { fetchAndSaveExchangeRate } = await import("@/lib/exchange-rate");
  const { rate, fromCache } = await fetchAndSaveExchangeRate();

  if (fromCache) {
    console.warn("[cron/exchange-rate] Usando cotação em cache:", rate);
  }

  const atRisk = await recalculateAllPlanMargins(rate);

  if (atRisk.length > 0) {
    const minMargin = await getSetting("min_margin_percent");
    const supportEmail = await getSetting("support_email");
    await sendMarginAlertEmail({
      to: supportEmail,
      minMarginPercent: parseFloat(minMargin),
      plans: atRisk,
      usdRate: rate,
    });
  }

  return { rate, fromCache, atRiskCount: atRisk.length };
}

export async function getAtRiskPlans(): Promise<PlanMarginInfo[]> {
  const usdRate = await getLatestExchangeRate();
  const minMargin = parseFloat(await getSetting("min_margin_percent"));
  const allPlans = await db.select().from(plans);

  return allPlans
    .map((plan) => {
      const retail = parseFloat(plan.retailPriceBrl);
      const wholesale = parseFloat(plan.wholesalePriceUsd);
      const currentMargin = plan.currentMarginPercent
        ? parseFloat(plan.currentMarginPercent)
        : calculateCurrentMarginPercent(retail, wholesale, usdRate);
      const status = getMarginStatus(currentMargin, minMargin);

      return {
        planId: plan.id,
        planName: plan.name,
        retailPriceBrl: retail,
        wholesalePriceUsd: wholesale,
        currentMargin,
        status,
        suggestedPrice: suggestReprice(retail, wholesale, usdRate, minMargin),
      };
    })
    .filter((p) => p.status === "red");
}
