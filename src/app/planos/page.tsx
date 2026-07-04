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

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-slate-500">
            Nenhum plano disponível. Execute <code className="rounded bg-slate-100 px-1">npm run db:seed</code> para popular o catálogo.
          </p>
        )}
      </div>
    </PublicLayout>
  );
}
