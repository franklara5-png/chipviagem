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
    // O NULL precisa do cast igual ao valor: sem ele o Postgres infere `text`
    // para a coluna do CTE, e a comparação de carência morre com
    // "operator does not exist: text <= timestamp". A query antiga só fazia
    // `is not null` e nunca exercitou o tipo, então isso passou despercebido.
    .map((r) => `('${r.status.replace(/'/g, "''")}'::text, ${r.paidAt ? `'${r.paidAt}'::timestamp` : "NULL::timestamp"})`)
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

  const agora = new Date().toISOString();
  const antigo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const recemPago = await countOverRows([{ status: "paid", paidAt: agora }]);
  assert(
    recemPago === 0,
    `pedido pago AGORA não conta — pode ser entrega em andamento (recebido ${recemPago})`
  );

  const pagoAntigo = await countOverRows([{ status: "paid", paidAt: antigo }]);
  assert(
    pagoAntigo === 1,
    `o mesmo pedido além da carência conta (recebido ${pagoAntigo})`
  );

  const falhouAgora = await countOverRows([{ status: "failed", paidAt: agora }]);
  assert(
    falhouAgora === 1,
    `failed com paid_at conta NA HORA, sem carência — já quebrou, não há nada em andamento (recebido ${falhouAgora})`
  );

  const presoSemData = await countOverRows([{ status: "provisioning", paidAt: null }]);
  assert(
    presoSemData === 1,
    `provisioning sem paid_at conta — anomalia, invisível seria pior (recebido ${presoSemData})`
  );

  const matriz = await countOverRows([
    { status: "paid", paidAt: agora }, // não conta — dentro da carência
    { status: "paid", paidAt: antigo }, // conta
    { status: "provisioning", paidAt: agora }, // não conta — dentro da carência
    { status: "provisioning", paidAt: antigo }, // conta — preso
    { status: "failed", paidAt: agora }, // conta — sem carência
    { status: "failed", paidAt: null }, // não conta — nunca pagou
    { status: "delivered", paidAt: antigo }, // não conta
    { status: "refunded", paidAt: antigo }, // não conta
    { status: "pending", paidAt: null }, // não conta
  ]);
  assert(matriz === 3, `matriz de estados conta exatamente 3 (recebido ${matriz})`);

  // ── TESTE C: a armadilha do parâmetro dentro de string literal ──
  //
  // `interval '$1 minutes'` é aceito pelo Postgres SEM ERRO e vale 1 minuto —
  // o número escolhido nunca chega ao banco, e muda sozinho se a ordem dos
  // parâmetros mudar. Mordeu no RevelaPlaca em 17/09/2026 e o teste de lá não
  // pegou, porque conferia só o texto do SQL. Aqui a carência tem que estar
  // entre os PARÂMETROS.
  console.log("\nTESTE C — carência vai como parâmetro, não dentro de aspas:");
  const { sql: sqlGerado, params } = pagosSemAtivacaoQuery().toSQL();
  assert(
    !/interval\s+'\$\d/.test(sqlGerado),
    "nenhum parâmetro dentro de `interval '...'`"
  );
  assert(
    params.some((p) => Number(p) === 15),
    `a carência (15) aparece entre os params (recebido ${JSON.stringify(params)})`
  );

  console.log("\nTodos os testes passaram.");
}

main();
