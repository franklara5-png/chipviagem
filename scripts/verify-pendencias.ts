/**
 * Verificação do bloco `pendencias` de /api/hermes/stats.
 *
 * TESTE A — banco de produção vazio: a função completa `getHermesStats()`
 * roda de verdade contra o banco e devolve `pendencias.pagosSemAtivacao === 0`
 * sem quebrar, com os campos existentes intactos.
 *
 * TESTE B — "pedido pago sem ativação conta 1": pega a MESMA query que o
 * Drizzle gera para a contagem (`pagosSemAtivacaoQuery().toSQL()`) e a executa
 * com a tabela `orders` sombreada por um CTE (`WITH "orders" AS (VALUES ...)`).
 * O SQL de produção roda de verdade, sem inserir nem uma linha em produção.
 *
 * Uso: npx tsx scripts/verify-pendencias.ts
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { getHermesStats, pagosSemAtivacaoQuery } from "../src/lib/hermes-stats";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) {
    console.error(`✗ FALHOU: ${message}`);
    process.exit(1);
  }
  console.log(`✓ ${message}`);
}

/** Executa o SQL exato da contagem com `orders` sombreada por um CTE. */
async function countOverRows(rows: Array<{ status: string; paidAt: string | null }>) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurado (.env)");

  const { sql: generatedSql, params } = pagosSemAtivacaoQuery().toSQL();

  const values = rows
    .map((r) => `('${r.status.replace(/'/g, "''")}'::text, ${r.paidAt ? `'${r.paidAt}'::timestamp` : "NULL"})`)
    .join(", ");

  // O SQL é o MESMO que a rota executa em produção, só que com `orders`
  // sombreada por um CTE — nada é escrito no banco. Os params ($1..$n)
  // são bindados de verdade na mesma ordem do toSQL().
  const fullSql = `WITH "orders" ("status", "paid_at") AS (VALUES ${values}) ${generatedSql}`;
  const client = neon(url) as unknown as {
    query: (q: string, params: unknown[]) => Promise<unknown>;
  };
  const result = await client.query(fullSql, [...params]);

  const list = (Array.isArray(result) ? result : ((result as { rows?: unknown[] })?.rows ?? [])) as Array<
    Record<string, unknown> | undefined
  >;
  // O drizzle mapeia o resultado por posição (chave `total` na aplicação);
  // no SQL cru o alias não aparece, então lemos a primeira coluna.
  const row = list[0];
  const raw = row ? (row.total ?? row.count ?? Object.values(row)[0]) : undefined;
  return raw == null ? NaN : Number(raw);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL não configurado (.env)");
    process.exit(1);
  }

  // ── TESTE A: banco real (produção, vazio hoje) ──
  console.log("TESTE A — banco de produção real (vazio):");
  const stats = await getHermesStats();
  assert(
    stats.pendencias.pagosSemAtivacao === 0,
    `pendencias.pagosSemAtivacao === 0 (recebido ${JSON.stringify(stats.pendencias)})`
  );
  assert(
    stats.clientes === 0 && stats.onlineAgora === 0 && stats.visitantesHoje === 0,
    "campos existentes intactos (clientes/onlineAgora/visitantesHoje === 0)"
  );
  assert(
    !("receita" in stats),
    "receita omitida quando não há venda hoje (mesmo comportamento de antes)"
  );

  // ── TESTE B: mesmo SQL, tabela sombreada por CTE ──
  console.log("\nTESTE B — SQL real com `orders` sombreada por CTE:");
  const umPago = await countOverRows([{ status: "paid", paidAt: new Date().toISOString() }]);
  assert(umPago === 1, `um pedido pago sem ativação conta 1 (recebido ${umPago})`);

  const matriz = await countOverRows([
    { status: "paid", paidAt: new Date().toISOString() }, // conta
    { status: "provisioning", paidAt: new Date().toISOString() }, // conta
    { status: "failed", paidAt: new Date().toISOString() }, // conta (pagou, chip não saiu)
    { status: "failed", paidAt: null }, // não conta (nunca pagou)
    { status: "delivered", paidAt: new Date().toISOString() }, // não conta
    { status: "refunded", paidAt: new Date().toISOString() }, // não conta
    { status: "pending", paidAt: null }, // não conta
  ]);
  assert(matriz === 3, `matriz de estados conta exatamente 3 (recebido ${matriz})`);

  console.log("\nTodos os testes passaram.");
}

main();
