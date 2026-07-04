import Link from "next/link";
import { db } from "@/db";
import { orders, plans } from "@/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { formatBrl } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  provisioning: "Provisionando",
  delivered: "Entregue",
  failed: "Falhou",
  refunded: "Reembolsado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  provisioning: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-slate-100 text-slate-600",
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function PedidosPage({ searchParams }: PageProps) {
  const { q, status } = await searchParams;

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(eq(orders.status, status as typeof orders.status.enumValues[number]));
  }
  if (q) {
    conditions.push(
      or(
        ilike(orders.customerEmail, `%${q}%`),
        ilike(orders.customerName, `%${q}%`),
        ilike(orders.publicId, `%${q}%`)
      )
    );
  }

  const rows = await db
    .select({
      order: orders,
      planName: plans.name,
    })
    .from(orders)
    .innerJoin(plans, eq(orders.planId, plans.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Pedidos</h1>

      <form className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por e-mail, nome ou ID..."
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          name="status"
          defaultValue={status ?? "all"}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="all">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Filtrar
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Nenhum pedido encontrado
                </td>
              </tr>
            ) : (
              rows.map(({ order, planName }) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="font-mono text-primary hover:underline"
                    >
                      {order.publicId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.customerName}</p>
                    <p className="text-xs text-slate-400">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">{planName}</td>
                  <td className="px-4 py-3">{formatBrl(order.amountBrl)}</td>
                  <td className="px-4 py-3 uppercase">{order.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {format(order.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
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
