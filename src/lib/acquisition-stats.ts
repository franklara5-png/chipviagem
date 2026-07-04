import { and, count, desc, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import type { AcquisitionChannel } from "@/lib/acquisition";
import { CHANNEL_LABELS } from "@/lib/acquisition";

export interface AcquisitionPeriod {
  from: Date;
  to: Date;
}

export function resolvePeriod(
  preset: string,
  customFrom?: string,
  customTo?: string
): AcquisitionPeriod {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  if (preset === "custom" && customFrom) {
    const from = new Date(customFrom);
    from.setHours(0, 0, 0, 0);
    const end = customTo ? new Date(customTo) : to;
    end.setHours(23, 59, 59, 999);
    return { from, to: end };
  }

  const from = new Date();
  from.setHours(0, 0, 0, 0);

  if (preset === "90d") from.setDate(from.getDate() - 90);
  else if (preset === "30d") from.setDate(from.getDate() - 30);
  else from.setDate(from.getDate() - 7);

  return { from, to };
}

function periodFilter(period: AcquisitionPeriod) {
  return and(gte(orders.createdAt, period.from), lte(orders.createdAt, period.to));
}

export async function getChannelStats(period: AcquisitionPeriod) {
  const rows = await db
    .select({
      channel: orders.channel,
      ordersCount: count(),
      paidCount: sql<number>`count(*) filter (where ${orders.status} in ('paid', 'provisioning', 'delivered'))`,
      revenue: sql<string>`coalesce(sum(case when ${orders.status} = 'delivered' then ${orders.amountBrl}::numeric else 0 end), 0)`,
    })
    .from(orders)
    .where(periodFilter(period))
    .groupBy(orders.channel)
    .orderBy(desc(sql`coalesce(sum(case when ${orders.status} = 'delivered' then ${orders.amountBrl}::numeric else 0 end), 0)`));

  return rows.map((row) => {
    const total = Number(row.ordersCount);
    const paid = Number(row.paidCount);
    const channel = (row.channel ?? "unknown") as AcquisitionChannel;
    return {
      channel,
      label: CHANNEL_LABELS[channel] ?? row.channel ?? "Desconhecido",
      orders: total,
      paidOrders: paid,
      revenue: parseFloat(row.revenue ?? "0"),
      conversionRate: total > 0 ? (paid / total) * 100 : 0,
    };
  });
}

export async function getTopLandingPages(period: AcquisitionPeriod, limit = 10) {
  const rows = await db
    .select({
      landingPage: orders.landingPage,
      ordersCount: count(),
      revenue: sql<string>`coalesce(sum(case when ${orders.status} = 'delivered' then ${orders.amountBrl}::numeric else 0 end), 0)`,
    })
    .from(orders)
    .where(and(periodFilter(period), sql`${orders.landingPage} is not null`))
    .groupBy(orders.landingPage)
    .orderBy(desc(sql`coalesce(sum(case when ${orders.status} = 'delivered' then ${orders.amountBrl}::numeric else 0 end), 0)`))
    .limit(limit);

  return rows.map((row) => ({
    landingPage: row.landingPage ?? "/",
    orders: Number(row.ordersCount),
    revenue: parseFloat(row.revenue ?? "0"),
  }));
}

export async function getTopReferrerDomains(period: AcquisitionPeriod, limit = 10) {
  const rows = await db
    .select({
      referrerDomain: orders.referrerDomain,
      ordersCount: count(),
      revenue: sql<string>`coalesce(sum(case when ${orders.status} = 'delivered' then ${orders.amountBrl}::numeric else 0 end), 0)`,
    })
    .from(orders)
    .where(and(periodFilter(period), sql`${orders.referrerDomain} is not null`))
    .groupBy(orders.referrerDomain)
    .orderBy(desc(sql`coalesce(sum(case when ${orders.status} = 'delivered' then ${orders.amountBrl}::numeric else 0 end), 0)`))
    .limit(limit);

  return rows.map((row) => ({
    referrerDomain: row.referrerDomain ?? "",
    orders: Number(row.ordersCount),
    revenue: parseFloat(row.revenue ?? "0"),
  }));
}

export async function getWeeklyRevenueByChannel(period: AcquisitionPeriod) {
  const rows = await db
    .select({
      week: sql<string>`to_char(date_trunc('week', ${orders.createdAt}), 'DD/MM')`,
      channel: orders.channel,
      revenue: sql<string>`coalesce(sum(case when ${orders.status} = 'delivered' then ${orders.amountBrl}::numeric else 0 end), 0)`,
    })
    .from(orders)
    .where(periodFilter(period))
    .groupBy(sql`date_trunc('week', ${orders.createdAt})`, orders.channel)
    .orderBy(sql`date_trunc('week', ${orders.createdAt})`);

  const weekMap = new Map<string, Record<string, number | string>>();

  for (const row of rows) {
    const week = row.week ?? "";
    if (!weekMap.has(week)) weekMap.set(week, { week });
    const entry = weekMap.get(week)!;
    const channel = row.channel ?? "unknown";
    entry[channel] = parseFloat(row.revenue ?? "0");
  }

  return Array.from(weekMap.values());
}

export async function getTopChannelRevenueShare30d() {
  const period = resolvePeriod("30d");
  const channels = await getChannelStats(period);

  const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0);
  if (totalRevenue <= 0 || channels.length === 0) {
    return { channel: null as AcquisitionChannel | null, label: "—", sharePercent: 0 };
  }

  const top = channels[0];
  return {
    channel: top.channel,
    label: top.label,
    sharePercent: Math.round((top.revenue / totalRevenue) * 100),
  };
}

export const CHART_CHANNEL_COLORS: Record<string, string> = {
  organic: "#22c55e",
  referral_program: "#8b5cf6",
  social: "#ec4899",
  link: "#f59e0b",
  campaign: "#0ea5e9",
  direct: "#64748b",
  unknown: "#94a3b8",
};

export const CHART_CHANNELS = [
  "campaign",
  "organic",
  "referral_program",
  "social",
  "link",
  "direct",
  "unknown",
] as const;
