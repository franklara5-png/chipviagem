import type { Plan } from "@/db/schema";

export interface PlanSummary {
  id: string;
  slug: string;
  name: string;
  region: string;
  dataAmountMb: number;
  validityDays: number;
  retailPriceBrl: string;
  isFeatured: boolean;
}

export function toPlanSummary(plan: Plan): PlanSummary {
  return {
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    region: plan.region,
    dataAmountMb: plan.dataAmountMb,
    validityDays: plan.validityDays,
    retailPriceBrl: plan.retailPriceBrl,
    isFeatured: plan.isFeatured,
  };
}

/** Recomenda 1–3 planos que cobrem o GB estimado, priorizando destaque e melhor R$/GB */
export function recommendPlans(
  plans: PlanSummary[],
  estimatedMb: number,
  tripDays: number
): PlanSummary[] {
  const eligible = plans.filter(
    (p) => p.dataAmountMb >= estimatedMb && p.validityDays >= tripDays
  );

  const pool = eligible.length > 0 ? eligible : plans.filter((p) => p.dataAmountMb >= estimatedMb);

  if (pool.length === 0) {
    return [...plans]
      .sort((a, b) => a.dataAmountMb - b.dataAmountMb)
      .slice(0, 3);
  }

  return [...pool]
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      const costA = parseFloat(a.retailPriceBrl) / a.dataAmountMb;
      const costB = parseFloat(b.retailPriceBrl) / b.dataAmountMb;
      return costA - costB;
    })
    .slice(0, 3);
}

export function costPerGb(plan: PlanSummary): number {
  const gb = plan.dataAmountMb / 1024;
  return parseFloat(plan.retailPriceBrl) / gb;
}
