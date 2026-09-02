import { and, count, countDistinct, desc, gte, inArray, max, sum } from "drizzle-orm";
import { db } from "@/db";
import { orders, siteVisits } from "@/db/schema";
import { IS_HUMAN_VISIT } from "@/lib/human-visits";
import { startOfTodayInTimeZone } from "@/lib/timezone";

/** Pedidos que representam um cliente que efetivamente comprou. */
const PAID_STATUSES = ["paid", "provisioning", "delivered"] as const;

const SAO_PAULO_TZ = "America/Sao_Paulo";
const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const IPS_LISTA_LIMIT = 100;

export interface HermesIpEntry {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  views: number;
  lastAt: string;
}

export interface HermesStats {
  clientes: number;
  onlineAgora: number;
  visitantesHoje: number;
  ipsHoje: number;
  ipsLista: HermesIpEntry[];
  receita?: number;
}

/**
 * Stats consumidos pelo dashboard-frank (Hermes) via GET /api/hermes/stats.
 *
 * site_visits nunca faz upsert — cada visita é uma linha. A agregação
 * "1 IP = 1 entrada com views e último acesso" acontece só aqui, na leitura.
 */
export async function getHermesStats(): Promise<HermesStats> {
  const now = new Date();
  const todayStart = startOfTodayInTimeZone(SAO_PAULO_TZ, now);
  const onlineSince = new Date(now.getTime() - ONLINE_WINDOW_MS);

  const [[clientesRow], [onlineRow], [hojeRow], ipsRows, [receitaRow]] = await Promise.all([
    db
      .select({ total: countDistinct(orders.customerEmail) })
      .from(orders)
      .where(inArray(orders.status, [...PAID_STATUSES])),

    db
      .select({ total: countDistinct(siteVisits.ip) })
      .from(siteVisits)
      .where(and(gte(siteVisits.visitedAt, onlineSince), IS_HUMAN_VISIT)),

    db
      .select({ total: countDistinct(siteVisits.ip) })
      .from(siteVisits)
      .where(and(gte(siteVisits.visitedAt, todayStart), IS_HUMAN_VISIT)),

    db
      .select({
        ip: siteVisits.ip,
        city: max(siteVisits.city),
        region: max(siteVisits.region),
        country: max(siteVisits.country),
        views: count(),
        lastAt: max(siteVisits.visitedAt),
      })
      .from(siteVisits)
      .where(and(gte(siteVisits.visitedAt, todayStart), IS_HUMAN_VISIT))
      .groupBy(siteVisits.ip)
      .orderBy(desc(max(siteVisits.visitedAt)))
      .limit(IPS_LISTA_LIMIT),

    db
      .select({ total: sum(orders.amountBrl) })
      .from(orders)
      .where(gte(orders.paidAt, todayStart)),
  ]);

  const ipsLista: HermesIpEntry[] = ipsRows
    .filter((row) => row.ip && row.lastAt)
    .map((row) => ({
      ip: row.ip as string,
      ...(row.city ? { city: row.city } : {}),
      ...(row.region ? { region: row.region } : {}),
      ...(row.country ? { country: row.country } : {}),
      views: Number(row.views),
      lastAt: new Date(row.lastAt as NonNullable<typeof row.lastAt>).toISOString(),
    }));

  const stats: HermesStats = {
    clientes: Number(clientesRow?.total ?? 0),
    onlineAgora: Number(onlineRow?.total ?? 0),
    visitantesHoje: Number(hojeRow?.total ?? 0),
    ipsHoje: Number(hojeRow?.total ?? 0),
    ipsLista,
  };

  if (receitaRow?.total != null) {
    stats.receita = Number(receitaRow.total);
  }

  return stats;
}
