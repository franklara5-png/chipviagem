import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { PlanCard } from "@/components/plan-card";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getSeoMetadata } from "@/lib/seo";
import { PlanosFilter } from "./planos-filter";

export const dynamic = "force-dynamic";

export const metadata = getSeoMetadata({
  title: "Planos de chip de viagem (eSIM)",
  description: "Compare planos de eSIM para viagens internacionais. Filtre por região e país, ordene por preço.",
  path: "/planos",
});

export default async function PlanosPage({
  searchParams,
}: {
  searchParams: Promise<{ regiao?: string; ordenar?: string }>;
}) {
  const params = await searchParams;
  const allPlans = await db
    .select()
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(asc(plans.retailPriceBrl))
    .catch(() => [] as (typeof plans.$inferSelect)[]);

  const regions = [...new Set(allPlans.map((p) => p.region))].sort();

  let filtered = allPlans;
  if (params.regiao) {
    filtered = filtered.filter((p) => p.region === params.regiao);
  }
  if (params.ordenar === "preco-desc") {
    filtered = [...filtered].sort(
      (a, b) => parseFloat(b.retailPriceBrl) - parseFloat(a.retailPriceBrl)
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold text-ink">Planos de chip de viagem</h1>
        <p className="mt-2 text-slate-600">
          Escolha o plano ideal para seu destino. Entrega imediata após pagamento.
        </p>

        <PlanosFilter regions={regions} currentRegion={params.regiao} currentSort={params.ordenar} />

        <h2 className="mt-10 text-xl font-semibold text-ink">
          {params.regiao ? `Planos de eSIM para ${params.regiao}` : "Planos de eSIM por destino"}
        </h2>

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-700">
              {params.regiao
                ? "Nenhum plano disponível para esse filtro no momento."
                : "Estamos atualizando o catálogo de planos."}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Fale com a gente pelo suporte que montamos a melhor opção para o seu destino.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {params.regiao && (
                <Link
                  href="/planos"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
                >
                  Ver todos os destinos
                </Link>
              )}
              <Link
                href="/suporte"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Falar com o suporte
              </Link>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
