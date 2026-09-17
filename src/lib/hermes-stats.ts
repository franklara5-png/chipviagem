import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  max,
  or,
  sum,
} from "drizzle-orm";
import { db } from "@/db";
import { orders, siteVisits } from "@/db/schema";
import { IS_HUMAN_VISIT } from "@/lib/human-visits";
import { startOfTodayInTimeZone } from "@/lib/timezone";

/** Pedidos que representam um cliente que efetivamente comprou. */
const PAID_STATUSES = ["paid", "provisioning", "delivered"] as const;

/**
 * "Pago e o chip ainda não saiu": pedidos com pagamento confirmado que ainda
 * não chegaram a `delivered` — o eSIM só é registrado em `esims` na entrega,
 * então status entregue é o proxy de "entregue/ativado" (a ativação em si
 * acontece no celular do cliente e não gera registro no banco).
 *
 * Inclui `failed` com `paid_at` preenchido: o cliente pagou, o provisionamento
 * quebrou e só some quando um humano age (reprocessar ou reembolsar).
 */
export function pagosSemAtivacaoQuery() {
  return db
    .select({ total: count() })
    .from(orders)
    .where(
      or(
        inArray(orders.status, ["paid", "provisioning"]),
        and(eq(orders.status, "failed"), isNotNull(orders.paidAt))
      )
    );
}

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

export interface HermesPendencias {
  /**
   * Pedidos pagos cujo eSIM ainda não foi entregue/ativado. Sempre um
   * inteiro >= 0. Único campo computável hoje — `falhasFornecedor24h` e
   * `reembolsosPendentes` ficam de fora por não haver dado no schema
   * (sem timestamp de falha e sem estado de reembolso pendente).
   */
  pagosSemAtivacao: number;
}

export interface HermesStats {
  clientes: number;
  onlineAgora: number;
  visitantesHoje: number;
  ipsHoje: number;
  ipsLista: HermesIpEntry[];
  receita?: number;
  pendencias: HermesPendencias;
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

  const [[clientesRow], [onlineRow], [hojeRow], ipsRows, [receitaRow], [pendenciasRow]] =
    await Promise.all([
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

    pagosSemAtivacaoQuery(),
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
    pendencias: {
      pagosSemAtivacao: Number(pendenciasRow?.total ?? 0),
    },
  };

  if (receitaRow?.total != null) {
    stats.receita = Number(receitaRow.total);
  }

  return stats;
}
