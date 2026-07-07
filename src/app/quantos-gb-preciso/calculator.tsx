"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HABITS,
  INTENSITY_LABELS,
  type HabitKey,
  type UsageIntensity,
  calculateTotalMb,
  mbToGb,
  parseIntensity,
  buildShareUrl,
  calculateDailyMb,
} from "@/lib/data-usage";
import { recommendPlans, costPerGb, type PlanSummary } from "@/lib/plan-recommendations";
import { formatBrl, formatDataMb } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { usePageAssist } from "@/components/page-assist-context";
import { AiChatCalculatorButton } from "@/components/ai-chat-widget";

interface CalculatorProps {
  plans: PlanSummary[];
  destinoSlug?: string;
  destinoName?: string;
}

function defaultHabits(): Record<HabitKey, UsageIntensity> {
  return {
    maps: 2,
    whatsapp: 2,
    video: 0,
    social: 1,
    streaming: 1,
    music: 1,
    hotspot: 0,
  };
}

function parseFromParams(searchParams: URLSearchParams): {
  days: number;
  habits: Record<HabitKey, UsageIntensity>;
} {
  const days = Math.min(60, Math.max(1, parseInt(searchParams.get("dias") ?? "7", 10) || 7));
  const habits = defaultHabits();
  for (const h of HABITS) {
    habits[h.key] = parseIntensity(searchParams.get(h.key));
  }
  return { days, habits };
}

function DataGauge({ mb, maxMb }: { mb: number; maxMb: number }) {
  const pct = Math.min(100, (mb / maxMb) * 100);
  const gb = mbToGb(mb);

  let color = "bg-green-500";
  if (pct > 66) color = "bg-red-500";
  else if (pct > 33) color = "bg-yellow-500";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">Estimativa com margem de segurança</span>
        <span className="text-2xl font-bold text-ink">{gb} GB</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>0 GB</span>
        <span>{mbToGb(maxMb)} GB</span>
      </div>
    </div>
  );
}

export function GbCalculator({ plans, destinoSlug, destinoName }: CalculatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageAssist = usePageAssist();

  const initial = parseFromParams(searchParams);
  const [days, setDays] = useState(initial.days);
  const [habits, setHabits] = useState(initial.habits);
  const [copied, setCopied] = useState(false);

  const syncUrl = useCallback(
    (d: number, h: Record<HabitKey, UsageIntensity>) => {
      const params = new URLSearchParams();
      params.set("dias", String(d));
      for (const habit of HABITS) {
        params.set(habit.key, String(h[habit.key]));
      }
      if (destinoSlug) params.set("destino", destinoSlug);
      router.replace(`/quantos-gb-preciso?${params.toString()}`, { scroll: false });
    },
    [router, destinoSlug]
  );

  useEffect(() => {
    const parsed = parseFromParams(searchParams);
    setDays(parsed.days);
    setHabits(parsed.habits);
  }, [searchParams]);

  const totalMb = useMemo(() => calculateTotalMb({ days, habits }), [days, habits]);
  const dailyMb = useMemo(() => calculateDailyMb(habits), [habits]);
  const recommended = useMemo(
    () => recommendPlans(plans, totalMb, days),
    [plans, totalMb, days]
  );

  const maxGaugeMb = Math.max(totalMb * 1.2, 10 * 1024);

  useEffect(() => {
    if (!pageAssist) return;
    pageAssist.setCalculator({
      days,
      estimatedGb: mbToGb(totalMb),
      dailyMb,
      habits,
      destinoName,
      recommendedPlans: recommended.map((p) => ({
        name: p.name,
        slug: p.slug,
        dataAmountMb: p.dataAmountMb,
        validityDays: p.validityDays,
        retailPriceBrl: p.retailPriceBrl,
        region: p.region,
      })),
    });
    return () => pageAssist.setCalculator(null);
  }, [pageAssist, days, totalMb, dailyMb, habits, destinoName, recommended]);

  function updateDays(d: number) {
    setDays(d);
    syncUrl(d, habits);
  }

  function updateHabit(key: HabitKey, value: UsageIntensity) {
    const next = { ...habits, [key]: value };
    setHabits(next);
    syncUrl(days, next);
  }

  async function copyLink() {
    const url = buildShareUrl(
      `${window.location.origin}/quantos-gb-preciso`,
      { days, habits },
      destinoSlug
    );
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      {destinoName && (
        <p className="rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary-dark">
          Planos filtrados para: <strong>{destinoName}</strong>
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-ink">
          Duração da viagem: <strong>{days} dias</strong>
        </label>
        <input
          type="range"
          min={1}
          max={60}
          value={days}
          onChange={(e) => updateDays(parseInt(e.target.value, 10))}
          className="mt-3 w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>1 dia</span>
          <span>60 dias</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">Seus hábitos de uso</h2>
        {HABITS.map((habit) => (
          <div
            key={habit.key}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="mb-3">
              <p className="font-medium text-ink">{habit.label}</p>
              <p className="text-xs text-slate-500">{habit.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {([0, 1, 2, 3] as UsageIntensity[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateHabit(habit.key, level)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    habits[habit.key] === level
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {INTENSITY_LABELS[level]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-white p-6">
        <DataGauge mb={totalMb} maxMb={maxGaugeMb} />
        <p className="mt-3 text-sm text-slate-600">
          ~{Math.round(dailyMb)} MB/dia · margem de segurança de 30% incluída
        </p>

        <button
          type="button"
          onClick={copyLink}
          className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Link copiado!" : "Copiar link para compartilhar com o grupo"}
        </button>

        <AiChatCalculatorButton />
      </div>

      {recommended.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-ink">
            Planos recomendados para você
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                {plan.isFeatured && (
                  <span className="mb-2 w-fit rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                    Destaque
                  </span>
                )}
                <h3 className="font-semibold text-ink">{plan.name}</h3>
                <p className="text-sm text-slate-500">{plan.region}</p>
                <div className="mt-2 flex gap-3 text-sm text-slate-600">
                  <span>{formatDataMb(plan.dataAmountMb)}</span>
                  <span>{plan.validityDays} dias</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {formatBrl(costPerGb(plan).toFixed(2))}/GB
                </p>
                <p className="mt-2 text-xl font-bold text-primary">
                  {formatBrl(plan.retailPriceBrl)}
                </p>
                <Link
                  href={`/checkout/${plan.slug}`}
                  className="mt-4 block rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-600"
                >
                  Comprar agora
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-slate-500">
            <Link href="/planos" className="text-primary hover:underline">
              Ver todos os planos →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
