import {
  HABITS,
  INTENSITY_LABELS,
  type HabitKey,
  type UsageIntensity,
  calculateTotalMb,
  mbToGb,
  parseIntensity,
} from "@/lib/data-usage";

export interface CalculatorPlanSnapshot {
  name: string;
  slug: string;
  dataAmountMb: number;
  validityDays: number;
  retailPriceBrl: string;
  region: string;
}

export interface CalculatorSnapshot {
  days: number;
  estimatedGb: number;
  dailyMb: number;
  habits: Record<HabitKey, UsageIntensity>;
  destinoName?: string;
  recommendedPlans: CalculatorPlanSnapshot[];
}

export function parseCalculatorFromSearchParams(
  searchParams: URLSearchParams
): Pick<CalculatorSnapshot, "days" | "habits"> {
  const days = Math.min(60, Math.max(1, parseInt(searchParams.get("dias") ?? "7", 10) || 7));
  const habits = {
    maps: parseIntensity(searchParams.get("maps")),
    whatsapp: parseIntensity(searchParams.get("whatsapp")),
    video: parseIntensity(searchParams.get("video")),
    social: parseIntensity(searchParams.get("social")),
    streaming: parseIntensity(searchParams.get("streaming")),
    music: parseIntensity(searchParams.get("music")),
    hotspot: parseIntensity(searchParams.get("hotspot")),
  } satisfies Record<HabitKey, UsageIntensity>;

  return { days, habits };
}

export function formatHabitsSummary(habits: Record<HabitKey, UsageIntensity>): string {
  return HABITS.map((h) => {
    const level = habits[h.key];
    if (level === 0) return null;
    return `${h.label}: ${INTENSITY_LABELS[level].toLowerCase()}`;
  })
    .filter(Boolean)
    .join("; ");
}

export function buildCalculatorContextBlock(snapshot: CalculatorSnapshot): string {
  const habitsSummary = formatHabitsSummary(snapshot.habits) || "uso mínimo (só o básico)";
  const destino = snapshot.destinoName ? `\n- Destino filtrado: ${snapshot.destinoName}` : "";

  const plansBlock =
    snapshot.recommendedPlans.length > 0
      ? snapshot.recommendedPlans
          .map(
            (p) =>
              `  • ${p.name} (${p.region}): ${Math.round(p.dataAmountMb / 1024)} GB, ${p.validityDays} dias, R$ ${parseFloat(p.retailPriceBrl).toFixed(2).replace(".", ",")} — checkout: /checkout/${p.slug}`
          )
          .join("\n")
      : "  (nenhum plano listado na página no momento)";

  return `
## Resultado da calculadora (use como fonte da verdade — NÃO invente outro número)
- Viagem: ${snapshot.days} dias
- Estimativa com margem de 30%: **${snapshot.estimatedGb} GB** (~${Math.round(snapshot.dailyMb)} MB/dia)
- Hábitos: ${habitsSummary}${destino}

Planos já recomendados na página para este perfil:
${plansBlock}

Quando o visitante perguntar sobre GB ou qual plano comprar, explique com base nesses dados e sugira um dos planos acima quando couber.`;
}
