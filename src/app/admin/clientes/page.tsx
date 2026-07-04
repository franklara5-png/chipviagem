import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { formatBrl } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function ClientesPage() {
  const rows = await db
    .select({
      email: orders.customerEmail,
      name: sql<string>`max(${orders.customerName})`.as("name"),
      totalOrders: sql<number>`count(*)`.as("total_orders"),
      totalSpent: sql<string>`sum(${orders.amountBrl})`.as("total_spent"),
      lastOrder: sql<Date>`max(${orders.createdAt})`.as("last_order"),
    })
    .from(orders)
    .groupBy(orders.customerEmail)
    .orderBy(desc(sql`max(${orders.createdAt})`));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Clientes</h1>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3">Total gasto</th>
              <th className="px-4 py-3">Último pedido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Nenhum cliente
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.email} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">{row.totalOrders}</td>
                  <td className="px-4 py-3">{formatBrl(row.totalSpent ?? 0)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {row.lastOrder
                      ? format(new Date(row.lastOrder), "dd/MM/yyyy", { locale: ptBR })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
