import { formatBrl } from "@/lib/utils";
import {
  getChannelStats,
  getTopLandingPages,
  getTopReferrerDomains,
  getWeeklyRevenueByChannel,
  resolvePeriod,
} from "@/lib/acquisition-stats";
import { AcquisitionChart } from "@/components/admin/acquisition-chart";

interface PageProps {
  searchParams: Promise<{
    period?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function AquisicaoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const periodKey = params.period ?? "30d";
  const period = resolvePeriod(periodKey, params.from, params.to);

  const [channels, landingPages, referrerDomains, weeklyData] = await Promise.all([
    getChannelStats(period),
    getTopLandingPages(period),
    getTopReferrerDomains(period),
    getWeeklyRevenueByChannel(period),
  ]);

  const periodOptions = [
    { label: "7 dias", value: "7d" },
    { label: "30 dias", value: "30d" },
    { label: "90 dias", value: "90d" },
    { label: "Personalizado", value: "custom" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Aquisição</h1>
        <p className="text-sm text-slate-500">
          Origem first-touch dos pedidos (UTMs, referrer e landing page da primeira visita).
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {periodOptions.map((opt) => (
          <a
            key={opt.value}
            href={`/admin/aquisicao?period=${opt.value}`}
            className={`rounded-full px-3 py-1 text-sm ${
              periodKey === opt.value
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      {periodKey === "custom" && (
        <form method="get" className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="period" value="custom" />
          <div>
            <label htmlFor="from" className="block text-xs text-slate-500">
              De
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={params.from}
              required
              className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="to" className="block text-xs text-slate-500">
              Até
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={params.to}
              className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Aplicar
          </button>
        </form>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-medium text-slate-600">Por canal</h2>
        {channels.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum pedido no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="pb-2 pr-4">Canal</th>
                  <th className="pb-2 pr-4">Pedidos</th>
                  <th className="pb-2 pr-4">Pagos</th>
                  <th className="pb-2 pr-4">Receita</th>
                  <th className="pb-2">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((row) => (
                  <tr key={row.channel} className="border-b border-slate-50">
                    <td className="py-2 pr-4 font-medium">{row.label}</td>
                    <td className="py-2 pr-4">{row.orders}</td>
                    <td className="py-2 pr-4">{row.paidOrders}</td>
                    <td className="py-2 pr-4">{formatBrl(row.revenue)}</td>
                    <td className="py-2">{row.conversionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-medium text-slate-600">
          Receita por canal por semana
        </h2>
        {weeklyData.length > 0 ? (
          <AcquisitionChart data={weeklyData} />
        ) : (
          <p className="py-12 text-center text-sm text-slate-400">Sem dados no período</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-medium text-slate-600">
            Top 10 landing pages (receita)
          </h2>
          {landingPages.length === 0 ? (
            <p className="text-sm text-slate-400">Sem dados.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {landingPages.map((row) => (
                <li key={row.landingPage} className="flex justify-between gap-4">
                  <span className="truncate font-mono text-xs text-slate-700">
                    {row.landingPage}
                  </span>
                  <span className="shrink-0 text-slate-500">
                    {formatBrl(row.revenue)} · {row.orders} ped.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-medium text-slate-600">
            Top 10 domínios referrer (receita)
          </h2>
          {referrerDomains.length === 0 ? (
            <p className="text-sm text-slate-400">Sem dados.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {referrerDomains.map((row) => (
                <li key={row.referrerDomain} className="flex justify-between gap-4">
                  <span className="truncate">{row.referrerDomain}</span>
                  <span className="shrink-0 text-slate-500">
                    {formatBrl(row.revenue)} · {row.orders} ped.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
