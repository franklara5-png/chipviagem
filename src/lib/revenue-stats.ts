import { and, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

/** Pedidos que representam receita reconhecida (mesmo critério do hermes-stats). */
const PAID_STATUSES = ["paid", "provisioning", "delivered"] as const;

const SAO_PAULO_TZ = "America/Sao_Paulo";

export interface RevenuePeriodRow {
  /** "2026-09" para mês, "2026" para ano — já ordenável como string. */
  periodKey: string;
  orders: number;
  revenueBrl: number;
  averageTicketBrl: number;
}

/**
 * `created_at`/`paid_at` são `timestamp` SEM timezone, gravados em UTC (a
 * sessão do Neon roda em GMT). Para agrupar por mês/ano no horário local de
 * São Paulo é preciso: (1) reinterpretar o valor naive como UTC, (2) converter
 * para o horário de parede em SP. O resultado volta a ser naive, então dá pra
 * comparar direto com `now() at time zone 'America/Sao_Paulo'` (mesma base).
 *
 * O timezone é escrito como literal na string SQL de propósito. Se ele fosse
 * um parâmetro bound do Drizzle, cada reuso do mesmo fragmento ganharia um
 * índice diferente ($1, $8, $9...) e o Postgres passaria a considerar a
 * expressão do SELECT diferente da do GROUP BY — a checagem é sintática, por
 * nó de parâmetro, não por valor —, quebrando a query com "column must appear
 * in the GROUP BY clause".
 */
const LOCAL_TS_SQL = sql`(coalesce(${orders.paidAt}, ${orders.createdAt}) at time zone 'UTC' at time zone 'America/Sao_Paulo')`;

/** "agora" no horário de parede de São Paulo, também naive — comparável com LOCAL_TS_SQL. */
const NOW_LOCAL_SQL = sql`(now() at time zone 'America/Sao_Paulo')`;

/** Inteiro validado e embutido como literal (nunca vem de input do usuário). */
function rawCount(value: number, fallback: number) {
  const n = Math.trunc(value);
  return sql.raw(String(Number.isFinite(n) && n > 0 ? n : fallback));
}

async function getRevenueByBucket(
  unit: "month" | "year",
  labelFormat: "YYYY-MM" | "YYYY",
  periods: number,
  fallbackPeriods: number
): Promise<RevenuePeriodRow[]> {
  const unitSql = sql.raw(`'${unit}'`);
  const bucket = sql`date_trunc(${unitSql}, ${LOCAL_TS_SQL})`;
  const labelSql = sql.raw(`'${labelFormat}'`);
  const back = rawCount(periods - 1, fallbackPeriods - 1);
  const intervalSql = sql.raw(`interval '1 ${unit}'`);

  const rows = await db
    .select({
      periodKey: sql<string>`to_char(${bucket}, ${labelSql})`,
      ordersCount: sql<number>`count(*)::int`,
      revenue: sql<string>`coalesce(sum(${orders.amountBrl}::numeric), 0)::text`,
      avgTicket: sql<string>`coalesce(avg(${orders.amountBrl}::numeric), 0)::text`,
    })
    .from(orders)
    .where(
      and(
        inArray(orders.status, [...PAID_STATUSES]),
        sql`${LOCAL_TS_SQL} >= date_trunc(${unitSql}, ${NOW_LOCAL_SQL}) - ${back} * ${intervalSql}`
      )
    )
    .groupBy(bucket)
    .orderBy(bucket);

  return rows.map((row) => ({
    periodKey: row.periodKey,
    orders: Number(row.ordersCount),
    revenueBrl: parseFloat(row.revenue ?? "0"),
    averageTicketBrl: parseFloat(row.avgTicket ?? "0"),
  }));
}

/** Receita por mês, últimos `months` meses (padrão 12), mais antigo primeiro. */
export function getRevenueByMonth(months = 12): Promise<RevenuePeriodRow[]> {
  return getRevenueByBucket("month", "YYYY-MM", months, 12);
}

/** Receita por ano, últimos `years` anos (padrão 5), mais antigo primeiro. */
export function getRevenueByYear(years = 5): Promise<RevenuePeriodRow[]> {
  return getRevenueByBucket("year", "YYYY", years, 5);
}

function currentSaoPauloParts(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAO_PAULO_TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);

  return {
    year: Number(parts.find((p) => p.type === "year")!.value),
    month: Number(parts.find((p) => p.type === "month")!.value),
  };
}

const EMPTY_ROW: Omit<RevenuePeriodRow, "periodKey"> = {
  orders: 0,
  revenueBrl: 0,
  averageTicketBrl: 0,
};

/** Preenche os meses sem pedidos com zero, mantendo a mesma janela usada na query SQL. */
export function fillMonthlyRevenue(rows: RevenuePeriodRow[], months = 12): RevenuePeriodRow[] {
  const byKey = new Map(rows.map((row) => [row.periodKey, row]));
  const { year, month } = currentSaoPauloParts();

  const result: RevenuePeriodRow[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(year, month - 1 - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    result.push(byKey.get(key) ?? { periodKey: key, ...EMPTY_ROW });
  }
  return result;
}

/** Preenche os anos sem pedidos com zero, mantendo a mesma janela usada na query SQL. */
export function fillYearlyRevenue(rows: RevenuePeriodRow[], years = 5): RevenuePeriodRow[] {
  const byKey = new Map(rows.map((row) => [row.periodKey, row]));
  const { year } = currentSaoPauloParts();

  const result: RevenuePeriodRow[] = [];
  for (let i = years - 1; i >= 0; i--) {
    const key = String(year - i);
    result.push(byKey.get(key) ?? { periodKey: key, ...EMPTY_ROW });
  }
  return result;
}

const MONTH_LABELS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** "2026-09" -> "set/2026" */
export function formatMonthLabel(periodKey: string): string {
  const [year, month] = periodKey.split("-");
  const idx = Number(month) - 1;
  const label = MONTH_LABELS[idx] ?? month;
  return `${label}/${year}`;
}
