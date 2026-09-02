import { and, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, siteVisits } from "@/db/schema";
import { IS_HUMAN_VISIT } from "@/lib/human-visits";
import {
  fillMonthlyRevenue,
  fillYearlyRevenue,
  getRevenueByMonth,
  getRevenueByYear,
  type RevenuePeriodRow,
} from "@/lib/revenue-stats";

/** Mesmo critério de receita reconhecida usado em hermes-stats/revenue-stats. */
const PAID_STATUSES = ["paid", "provisioning", "delivered"] as const;

type Unit = "month" | "year";
type LabelFormat = "YYYY-MM" | "YYYY";

/**
 * `orders.created_at`/`paid_at` são `timestamp` SEM timezone gravados em UTC:
 * reinterpreta como UTC e converte para o horário de parede de São Paulo.
 * `site_visits.visited_at` é `timestamptz`, então basta UM `at time zone`.
 *
 * O timezone vai como literal na string SQL de propósito: se fosse um
 * parâmetro bound do Drizzle, cada reuso do fragmento ganharia um índice
 * diferente ($1, $8...) e o Postgres passaria a ver a expressão do SELECT como
 * diferente da do GROUP BY (a checagem é sintática, por nó de parâmetro),
 * quebrando a query com "column must appear in the GROUP BY clause".
 */
const ORDER_LOCAL_TS_SQL = sql`(coalesce(${orders.paidAt}, ${orders.createdAt}) at time zone 'UTC' at time zone 'America/Sao_Paulo')`;
const VISIT_LOCAL_TS_SQL = sql`(${siteVisits.visitedAt} at time zone 'America/Sao_Paulo')`;

/** "agora" no horário de parede de São Paulo, naive — comparável com os de cima. */
const NOW_LOCAL_SQL = sql`(now() at time zone 'America/Sao_Paulo')`;

/** Inteiro validado e embutido como literal (nunca vem de input do usuário). */
function rawCount(value: number, fallback: number) {
  const n = Math.trunc(value);
  return sql.raw(String(Number.isFinite(n) && n > 0 ? n : fallback));
}

/** Janela idêntica à de revenue-stats: do início do período atual, `periods - 1` para trás. */
function windowStartSql(unit: Unit, periods: number, fallback: number) {
  const unitSql = sql.raw(`'${unit}'`);
  const back = rawCount(periods - 1, fallback - 1);
  const intervalSql = sql.raw(`interval '1 ${unit}'`);
  return sql`date_trunc(${unitSql}, ${NOW_LOCAL_SQL}) - ${back} * ${intervalSql}`;
}

/**
 * Clientes NOVOS: um e-mail conta uma única vez, no período da PRIMEIRA compra
 * paga dele. Contar e-mails distintos por mês inflaria o número toda vez que um
 * cliente antigo recomprasse. A base é `orders.customer_email`, não a tabela
 * `user` do Better Auth: o checkout aqui é de convidado (nome/e-mail/CPF vão
 * direto no pedido), então uma conta do Better Auth representa um cadastro, não
 * necessariamente um cliente que comprou. É também a mesma base do campo
 * `clientes` de /api/hermes/stats.
 */
async function getNewCustomersByBucket(
  unit: Unit,
  labelFormat: LabelFormat,
  periods: number,
  fallback: number
): Promise<Map<string, number>> {
  const firstOrders = db
    .select({
      firstAt: sql<string>`min(${ORDER_LOCAL_TS_SQL})`.as("first_at"),
    })
    .from(orders)
    .where(inArray(orders.status, [...PAID_STATUSES]))
    .groupBy(orders.customerEmail)
    .as("first_orders");

  const unitSql = sql.raw(`'${unit}'`);
  const labelSql = sql.raw(`'${labelFormat}'`);
  const bucket = sql`date_trunc(${unitSql}, ${firstOrders.firstAt})`;

  const rows = await db
    .select({
      periodKey: sql<string>`to_char(${bucket}, ${labelSql})`,
      total: sql<number>`count(*)::int`,
    })
    .from(firstOrders)
    .where(sql`${firstOrders.firstAt} >= ${windowStartSql(unit, periods, fallback)}`)
    .groupBy(bucket)
    .orderBy(bucket);

  return new Map(rows.map((row) => [row.periodKey, Number(row.total)]));
}

/**
 * Visitantes = IPs únicos no período (site_visits nunca faz upsert, 1 linha =
 * 1 visita), já sem as linhas de máquina — ver `IS_HUMAN_VISIT`.
 */
async function getVisitorsByBucket(
  unit: Unit,
  labelFormat: LabelFormat,
  periods: number,
  fallback: number
): Promise<Map<string, number>> {
  const unitSql = sql.raw(`'${unit}'`);
  const labelSql = sql.raw(`'${labelFormat}'`);
  const bucket = sql`date_trunc(${unitSql}, ${VISIT_LOCAL_TS_SQL})`;

  const rows = await db
    .select({
      periodKey: sql<string>`to_char(${bucket}, ${labelSql})`,
      total: sql<number>`count(distinct ${siteVisits.ip})::int`,
    })
    .from(siteVisits)
    .where(
      and(sql`${VISIT_LOCAL_TS_SQL} >= ${windowStartSql(unit, periods, fallback)}`, IS_HUMAN_VISIT)
    )
    .groupBy(bucket)
    .orderBy(bucket);

  return new Map(rows.map((row) => [row.periodKey, Number(row.total)]));
}

export interface HermesHistoryPeriod {
  /** "YYYY-MM" no mensal, "YYYY" no anual — America/Sao_Paulo. */
  period: string;
  /** Receita em REAIS. `amount_brl` já é líquido de desconto. */
  receita: number;
  pedidos: number;
  clientesNovos: number;
  visitantes: number;
}

export interface HermesHistory {
  monthly: HermesHistoryPeriod[];
  yearly: HermesHistoryPeriod[];
}

function merge(
  revenueRows: RevenuePeriodRow[],
  newCustomers: Map<string, number>,
  visitors: Map<string, number>
): HermesHistoryPeriod[] {
  return revenueRows.map((row) => ({
    period: row.periodKey,
    receita: row.revenueBrl,
    pedidos: row.orders,
    clientesNovos: newCustomers.get(row.periodKey) ?? 0,
    visitantes: visitors.get(row.periodKey) ?? 0,
  }));
}

/**
 * Histórico mensal/anual para o dashboard interno (Hermes / dashboard-frank).
 *
 * Sem `custo`: este site não guarda snapshot de custo por pedido
 * (`plans.wholesale_price_usd` é o preço ATUAL do fornecedor, não o vigente na
 * data da venda), então qualquer margem histórica seria inventada.
 *
 * Períodos sem movimento vêm com zeros; a ordem é ascendente (mais antigo
 * primeiro), garantida pelo preenchimento de revenue-stats.
 */
export async function getHermesHistory(months = 12, years = 5): Promise<HermesHistory> {
  const [
    monthlyRevenue,
    yearlyRevenue,
    monthlyNewCustomers,
    yearlyNewCustomers,
    monthlyVisitors,
    yearlyVisitors,
  ] = await Promise.all([
    getRevenueByMonth(months),
    getRevenueByYear(years),
    getNewCustomersByBucket("month", "YYYY-MM", months, 12),
    getNewCustomersByBucket("year", "YYYY", years, 5),
    getVisitorsByBucket("month", "YYYY-MM", months, 12),
    getVisitorsByBucket("year", "YYYY", years, 5),
  ]);

  return {
    monthly: merge(fillMonthlyRevenue(monthlyRevenue, months), monthlyNewCustomers, monthlyVisitors),
    yearly: merge(fillYearlyRevenue(yearlyRevenue, years), yearlyNewCustomers, yearlyVisitors),
  };
}
