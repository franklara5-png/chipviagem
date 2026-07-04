import { db } from "@/db";
import { priceChanges, plans } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatBrl } from "@/lib/utils";

export async function PriceChangeHistory() {
  const changes = await db
    .select({
      id: priceChanges.id,
      oldPrice: priceChanges.oldPrice,
      newPrice: priceChanges.newPrice,
      reason: priceChanges.reason,
      createdAt: priceChanges.createdAt,
      planName: plans.name,
    })
    .from(priceChanges)
    .innerJoin(plans, eq(priceChanges.planId, plans.id))
    .orderBy(desc(priceChanges.createdAt))
    .limit(50);

  if (changes.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-400">Nenhum reajuste registrado</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
          <tr>
            <th className="px-4 py-2">Data</th>
            <th className="px-4 py-2">Plano</th>
            <th className="px-4 py-2">De</th>
            <th className="px-4 py-2">Para</th>
            <th className="px-4 py-2">Motivo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {changes.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-2 text-slate-500">
                {c.createdAt?.toLocaleString("pt-BR") ?? "—"}
              </td>
              <td className="px-4 py-2">{c.planName}</td>
              <td className="px-4 py-2">{formatBrl(c.oldPrice)}</td>
              <td className="px-4 py-2 font-medium">{formatBrl(c.newPrice)}</td>
              <td className="px-4 py-2 text-slate-500">{c.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
