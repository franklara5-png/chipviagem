import Link from "next/link";
import { db } from "@/db";
import { orders, plans } from "@/db/schema";
import { and, count, desc, eq, gte, inArray, sql, sum } from "drizzle-orm";
import { formatBrl } from "@/lib/utils";
import { getSetting } from "@/lib/settings";
import { getAtRiskPlans } from "@/lib/margin-sync";
import { getLatestExchangeRate } from "@/lib/exchange-rate";
import { SalesChart } from "@/components/admin/sales-chart";
import { AlertTriangle } from "lucide-react";

const PAID_STATUSES = ["paid", "provisioning", "delivered"] as const;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const days7 = new Date(now);
  days7.setDate(days7.getDate() - 7);
  const days30 = new Date(now);
  days30.setDate(days30.getDate() - 30);
  const monthStart = startOfMonth(now);

  const paidStatuses = inArray(orders.status, [...PAID_STATUSES]);

  const [revenueMonth] = await db
    .select({ total: sum(orders.amountBrl) })
    .from(orders)
    .where(and(paidStatuses, gte(orders.paidAt, monthStart), eq(orders.status, "delivered")));

  const [ordersToday] = await db
    .select({ total: count() })
    .from(orders)
    .where(gte(orders.createdAt, todayStart));

  const [orders7d] = await db
    .select({ total: count() })
    .from(orders)
    .where(gte(orders.createdAt, days7));

  const [orders30d] = await db
    .select({ total: count() })
    .from(orders)
    .where(gte(orders.createdAt, days30));

  const [avgTicket] = await db
    .select({ avg: sql<string>`avg(${orders.amountBrl})` })
    .from(orders)
    .where(inArray(orders.status, [...PAID_STATUSES]));

  const [failedCount] = await db
    .select({ total: count() })
    .from(orders)
    .where(eq(orders.status, "failed"));

  const minMargin = await getSetting("min_margin_percent");
  const usdRate = await getLatestExchangeRate();
  const atRiskPlans = await getAtRiskPlans();

  const salesPerDay = await db
    .select({
      date: sql<string>`date(${orders.paidAt})`.as("date"),
      revenue: sum(orders.amountBrl),
      ordersCount: count(),
    })
    .from(orders)
    .where(and(gte(orders.paidAt, days30), eq(orders.status, "delivered")))
    .groupBy(sql`date(${orders.paidAt})`)
    .orderBy(sql`date(${orders.paidAt})`);

  const chartData = salesPerDay.map((row) => ({
    date: row.date?.slice(5) ?? "",
    revenue: parseFloat(row.revenue ?? "0"),
    orders: Number(row.ordersCount),
  }));

  const topDestinations = await db
    .select({
      region: plans.region,
      total: count(),
      revenue: sum(orders.amountBrl),
    })
    .from(orders)
    .innerJoin(plans, eq(orders.planId, plans.id))
    .where(eq(orders.status, "delivered"))
    .groupBy(plans.region)
    .orderBy(desc(count()))
    .limit(5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>

      {atRiskPlans.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            {atRiskPlans.length} plano(s) com margem abaixo de {minMargin}% (cotação USD {usdRate.toFixed(4)}).{" "}
            <Link href="/admin/planos?risco=1" className="underline">
              Ver planos em risco
            </Link>
          </p>
        </div>
      )}

      {Number(failedCount?.total ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            {failedCount?.total} pedido(s) com falha.{" "}
            <Link href="/admin/pedidos?status=failed" className="underline">
              Ver pedidos
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Receita do mês" value={formatBrl(revenueMonth?.total ?? 0)} />
        <StatCard label="Pedidos hoje" value={String(ordersToday?.total ?? 0)} />
        <StatCard label="Pedidos 7 dias" value={String(orders7d?.total ?? 0)} />
        <StatCard label="Pedidos 30 dias" value={String(orders30d?.total ?? 0)} />
        <StatCard label="Ticket médio" value={formatBrl(parseFloat(avgTicket?.avg ?? "0"))} />
        <StatCard label="Margem mínima" value={`${minMargin}%`} />
        <StatCard label="USD/BRL" value={usdRate.toFixed(4)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium text-slate-600">Vendas por dia (30 dias)</h2>
          {chartData.length > 0 ? (
            <SalesChart data={chartData} />
          ) : (
            <p className="py-12 text-center text-sm text-slate-400">Nenhuma venda no período</p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-medium text-slate-600">Top 5 destinos</h2>
          {topDestinations.length > 0 ? (
            <ul className="space-y-3">
              {topDestinations.map((dest, i) => (
                <li key={dest.region} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="mr-2 text-slate-400">{i + 1}.</span>
                    {dest.region}
                  </span>
                  <span className="text-slate-500">
                    {dest.total} · {formatBrl(dest.revenue ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Sem dados</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
