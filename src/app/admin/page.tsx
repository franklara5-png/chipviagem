import Link from "next/link";
import { db } from "@/db";
import { orders, plans } from "@/db/schema";
import { and, count, desc, eq, gte, inArray, sql, sum } from "drizzle-orm";
import { formatBrl } from "@/lib/utils";
import { getSetting } from "@/lib/settings";
import { getAtRiskPlans } from "@/lib/margin-sync";
import { getLatestExchangeRate } from "@/lib/exchange-rate";
import { getReviewStats } from "@/lib/reviews";
import { getReferralStats30d } from "@/lib/referrals";
import { getWhatsAppClicks7d } from "@/lib/analytics";
import { getTopChannelRevenueShare30d } from "@/lib/acquisition-stats";
import {
  getRevenueByMonth,
  getRevenueByYear,
  fillMonthlyRevenue,
  fillYearlyRevenue,
  formatMonthLabel,
} from "@/lib/revenue-stats";
import { SalesChart } from "@/components/admin/sales-chart";
import { RevenueByPeriodChart } from "@/components/admin/revenue-by-period-chart";
import { AlertTriangle } from "lucide-react";

const PAID_STATUSES = ["paid", "provisioning", "delivered"] as const;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const days7 = new Date(now);
  days7.setDate(days7.getDate() - 7);
  const days30 = new Date(now);
  days30.setDate(days30.getDate() - 30);

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
  const reviewStats = await getReviewStats();
  const referralStats = await getReferralStats30d();
  const whatsappClicks7d = await getWhatsAppClicks7d();
  const topChannel = await getTopChannelRevenueShare30d();

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

  const [revenueByMonthRaw, revenueByYearRaw] = await Promise.all([
    getRevenueByMonth(12),
    getRevenueByYear(5),
  ]);
  const revenueByMonth = fillMonthlyRevenue(revenueByMonthRaw, 12);
  const revenueByYear = fillYearlyRevenue(revenueByYearRaw, 5);
  // Último item da série = mês corrente em São Paulo (fillMonthlyRevenue sempre
  // devolve a janela completa, então o card e a tabela nunca divergem).
  const currentMonthRevenue = revenueByMonth.at(-1)?.revenueBrl ?? 0;

  const revenueChartData = revenueByMonth.map((row) => ({
    label: formatMonthLabel(row.periodKey),
    revenue: row.revenueBrl,
    orders: row.orders,
  }));

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
        <StatCard label="Receita do mês" value={formatBrl(currentMonthRevenue)} />
        <StatCard label="Pedidos hoje" value={String(ordersToday?.total ?? 0)} />
        <StatCard label="Pedidos 7 dias" value={String(orders7d?.total ?? 0)} />
        <StatCard label="Pedidos 30 dias" value={String(orders30d?.total ?? 0)} />
        <StatCard label="Ticket médio" value={formatBrl(parseFloat(avgTicket?.avg ?? "0"))} />
        <StatCard label="Margem mínima" value={`${minMargin}%`} />
        <StatCard label="USD/BRL" value={usdRate.toFixed(4)} />
        <StatCard
          label="Nota média"
          value={reviewStats.totalApproved > 0 ? `${reviewStats.averageRating} ★` : "—"}
        />
        <StatCard
          label="Avaliações pendentes"
          value={String(reviewStats.pendingModeration)}
        />
        <StatCard
          label="Vendas por indicação (30d)"
          value={`${referralStats.conversions30d} · ${formatBrl(referralStats.revenue30d)}`}
        />
        <StatCard label="Cliques no WhatsApp (7d)" value={String(whatsappClicks7d)} />
        <StatCard
          label="Canal top (30d)"
          value={
            topChannel.channel
              ? `${topChannel.label} — ${topChannel.sharePercent}%`
              : "—"
          }
        />
      </div>

      {reviewStats.pendingModeration > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-900">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            {reviewStats.pendingModeration} avaliação(ões) aguardando moderação.{" "}
            <Link href="/admin/avaliacoes?status=pending" className="underline">
              Moderar agora
            </Link>
          </p>
        </div>
      )}

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

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-medium text-slate-600">Receita por período</h2>

        <RevenueByPeriodChart data={revenueChartData} />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Por mês
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="py-2 pr-4 font-medium">Mês</th>
                    <th className="py-2 pr-4 font-medium">Pedidos</th>
                    <th className="py-2 pr-4 font-medium">Receita</th>
                    <th className="py-2 font-medium">Ticket médio</th>
                  </tr>
                </thead>
                <tbody>
                  {[...revenueByMonth].reverse().map((row) => (
                    <tr key={row.periodKey} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-4 text-ink">{formatMonthLabel(row.periodKey)}</td>
                      <td className="py-2 pr-4 text-slate-600">{row.orders}</td>
                      <td className="py-2 pr-4 text-slate-600">{formatBrl(row.revenueBrl)}</td>
                      <td className="py-2 text-slate-600">{formatBrl(row.averageTicketBrl)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Por ano
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="py-2 pr-4 font-medium">Ano</th>
                    <th className="py-2 pr-4 font-medium">Pedidos</th>
                    <th className="py-2 pr-4 font-medium">Receita</th>
                    <th className="py-2 font-medium">Ticket médio</th>
                  </tr>
                </thead>
                <tbody>
                  {[...revenueByYear].reverse().map((row) => (
                    <tr key={row.periodKey} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-4 text-ink">{row.periodKey}</td>
                      <td className="py-2 pr-4 text-slate-600">{row.orders}</td>
                      <td className="py-2 pr-4 text-slate-600">{formatBrl(row.revenueBrl)}</td>
                      <td className="py-2 text-slate-600">{formatBrl(row.averageTicketBrl)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
