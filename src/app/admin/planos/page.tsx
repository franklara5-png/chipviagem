import { Suspense } from "react";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PlanRow } from "@/components/admin/plan-row";
import { PlanosRiskFilter } from "@/components/admin/planos-risk-filter";
import { PriceChangeHistory } from "@/components/admin/price-change-history";
import { getLatestExchangeRate } from "@/lib/exchange-rate";
import { calculateCurrentMarginPercent, getMarginStatus } from "@/lib/margin";
import { getSetting } from "@/lib/settings";
import { syncCatalogAction } from "./actions";

interface PlanosPageProps {
  searchParams: Promise<{ risco?: string }>;
}

export default async function PlanosPage({ searchParams }: PlanosPageProps) {
  const params = await searchParams;
  const onlyRisk = params.risco === "1";

  const [allPlans, usdRate, minMarginStr, autoReprice] = await Promise.all([
    db.select().from(plans).orderBy(desc(plans.updatedAt)),
    getLatestExchangeRate(),
    getSetting("min_margin_percent"),
    getSetting("auto_reprice_enabled"),
  ]);

  const minMargin = parseFloat(minMarginStr);

  const plansWithMargin = allPlans.map((plan) => {
    const retail = parseFloat(plan.retailPriceBrl);
    const wholesale = parseFloat(plan.wholesalePriceUsd);
    const currentMargin = plan.currentMarginPercent
      ? parseFloat(plan.currentMarginPercent)
      : calculateCurrentMarginPercent(retail, wholesale, usdRate);
    const marginStatus = getMarginStatus(currentMargin, minMargin);
    return { plan, currentMargin, marginStatus };
  });

  const filtered = onlyRisk
    ? plansWithMargin.filter((p) => p.marginStatus === "red")
    : plansWithMargin;

  const atRiskCount = plansWithMargin.filter((p) => p.marginStatus === "red").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Planos</h1>
          <p className="text-sm text-slate-500">
            Cotação USD/BRL: <strong>{usdRate.toFixed(4)}</strong>
            {autoReprice === "true" && (
              <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                Reajuste automático ativo
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Suspense fallback={null}>
            <PlanosRiskFilter />
          </Suspense>
          <form action={syncCatalogAction}>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Importar catálogo
            </button>
          </form>
        </div>
      </div>

      {atRiskCount > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {atRiskCount} plano(s) com margem abaixo de {minMargin}%.
          {onlyRisk ? null : (
            <> <a href="/admin/planos?risco=1" className="underline">Ver só em risco</a></>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Região</th>
              <th className="px-4 py-3">Dados</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3">Atacado (USD)</th>
              <th className="px-4 py-3">Varejo / Status</th>
              <th className="px-4 py-3">Margem</th>
              <th className="px-4 py-3">Câmbio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  {onlyRisk ? "Nenhum plano em risco." : 'Nenhum plano. Clique em "Importar catálogo".'}
                </td>
              </tr>
            ) : (
              filtered.map(({ plan, currentMargin, marginStatus }) => (
                <PlanRow
                  key={plan.id}
                  plan={plan}
                  currentMargin={currentMargin}
                  marginStatus={marginStatus}
                  usdRate={usdRate}
                  minMargin={minMargin}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-medium text-slate-600">Histórico de reajustes de preço</h2>
        <PriceChangeHistory />
      </section>
    </div>
  );
}
