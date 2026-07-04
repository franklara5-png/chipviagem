import { db } from "@/db";
import { plans } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PlanRow } from "@/components/admin/plan-row";
import { syncCatalogAction } from "./actions";

export default async function PlanosPage() {
  const allPlans = await db.select().from(plans).orderBy(desc(plans.updatedAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-ink">Planos</h1>
        <form action={syncCatalogAction}>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Importar catálogo
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Região</th>
              <th className="px-4 py-3">Dados</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3">Atacado (USD)</th>
              <th className="px-4 py-3" colSpan={4}>
                Varejo / Margem / Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allPlans.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  Nenhum plano. Clique em &quot;Importar catálogo&quot; para começar.
                </td>
              </tr>
            ) : (
              allPlans.map((plan) => <PlanRow key={plan.id} plan={plan} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
