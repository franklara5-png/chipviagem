import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  max,
  or,
  sql,
  sum,
} from "drizzle-orm";
import { db } from "@/db";
import { orders, siteVisits } from "@/db/schema";
import { IS_HUMAN_VISIT } from "@/lib/human-visits";
import { startOfTodayInTimeZone } from "@/lib/timezone";

/** Pedidos que representam um cliente que efetivamente comprou. */
const PAID_STATUSES = ["paid", "provisioning", "delivered"] as const;

/**
 * Carência entre `paid_at` e a entrega, para `paid`/`provisioning`.
 *
 * De onde saiu o número (17/09/2026): `markOrderPaid` grava
 * status='paid' + paid_at e chama `provisionOrder` na MESMA requisição.
 * `provisionOrder` marca 'provisioning' e faz duas chamadas de rede ao
 * fornecedor (`createOrder` e `getEsimDetails`) — que hoje NÃO têm timeout
 * configurado, então a janela só é limitada pelo teto da função na Vercel
 * (300s no padrão atual; não há `maxDuration` no repositório). 15 minutos dá
 * 3x sobre esse teto.
 *
 * Sem a carência, todo pedido contaria como pendência desde o instante do
 * pagamento até a entrega — o aviso do menu piscaria vermelho a cada venda e
 * viraria paisagem. A carência também é o que detecta o pedido que ficou
 * preso em 'provisioning' porque a função foi morta no meio: nesse caso o
 * `catch` que marcaria 'failed' nunca roda.
 */
const CARENCIA_PAGO_SEM_ATIVACAO_MIN = 15;

/**
 * "Pago e o chip ainda não saiu": pedidos com pagamento confirmado que ainda
 * não chegaram a `delivered` — o eSIM só é registrado em `esims` na entrega,
 * então status entregue é o proxy de "entregue/ativado" (a ativação em si
 * acontece no celular do cliente e não gera registro no banco).
 *
 * Dois casos, com regras DIFERENTES de propósito:
 *
 * - `failed` com `paid_at`: conta na hora. O provisionamento já quebrou, não
 *   há nada em andamento, e só some quando um humano reprocessa ou reembolsa.
 * - `paid`/`provisioning`: conta só depois da carência. Antes disso pode ser
 *   entrega em andamento, que se resolve sozinha.
 *
 * `paid_at` é `timestamp without time zone` guardando UTC, então a comparação
 * usa `now() at time zone 'UTC'` — não `now()` puro, que depende do TimeZone
 * da sessão (hoje GMT no Neon, mas isso não é garantia). Pedido em
 * `paid`/`provisioning` SEM `paid_at` é anomalia e conta: não dá para dizer
 * que está em andamento, e ficar invisível é pior.
 */
export function pagosSemAtivacaoQuery() {
  // NÃO escrever `interval '${N} minutes'`: o número interpolado vira
  // parâmetro, e o Postgres não substitui parâmetro dentro de string literal
  // — ele lê o dígito do índice. Isso gera `interval '$1 minutes'`, que é
  // aceito SEM ERRO e vale 1 minuto. Multiplicar mantém o valor como
  // parâmetro de verdade, fora das aspas. (Mordeu no RevelaPlaca em 17/09.)
  const foraDaCarencia = sql`${orders.paidAt} <= (now() at time zone 'UTC') - (${CARENCIA_PAGO_SEM_ATIVACAO_MIN} * interval '1 minute')`;

  return db
    .select({ total: count() })
    .from(orders)
    .where(
      or(
        and(eq(orders.status, "failed"), isNotNull(orders.paidAt)),
        and(
          inArray(orders.status, ["paid", "provisioning"]),
          or(isNull(orders.paidAt), foraDaCarencia)
        )
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
