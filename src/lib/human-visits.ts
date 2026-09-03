import { type SQL, and, sql } from "drizzle-orm";
import { siteVisits } from "@/db/schema";
import { BOT_UA_MARKS, COUNTRY_ALIASES, DATACENTER_CITIES } from "@/lib/visit-tracking";

/**
 * "Isto foi gente" escrito como condição de consulta.
 *
 * O filtro da gravação (`/api/track/visit`) só vale para o amanhã: as linhas
 * que entraram com o filtro fraco — datacenter e varredor que se declara
 * Chrome — continuam no banco e seguiriam aparecendo no card "IPs do dia".
 * Reclassificar com UPDATE reescreveria histórico de produção e criaria o
 * mesmo problema na próxima regra, então a decisão é avaliar IP, User-Agent e
 * localização na própria leitura.
 *
 * Espelha `isPrivateIp`, `isBotUserAgent`, `isDatacenterLocation` e
 * `isForeignWithoutCity` de `visit-tracking.ts` — as duas versões precisam
 * andar juntas, e é por isso que as listas vêm de lá em vez de copiadas.
 */

/** IP sem o prefixo IPv4-mapped, para comparar com as faixas privadas. */
const BARE_IP = sql`regexp_replace(coalesce(btrim(${siteVisits.ip}), ''), '^::ffff:', '', 'i')`;

/** Nem loopback, nem faixa privada (10/8, 192.168/16, 172.16/12). */
const IP_DE_VISITANTE = sql`(
  ${BARE_IP} <> ''
  and ${BARE_IP} <> '::1'
  and ${BARE_IP} not like '127.%'
  and ${BARE_IP} not like '10.%'
  and ${BARE_IP} not like '192.168.%'
  and ${BARE_IP} !~ '^172\\.(1[6-9]|2[0-9]|3[01])\\.'
)`;

/**
 * Mesma lista de `BOT_UA_MARKS` como alternância de regex do Postgres. Todas
 * as marcas são substring literal, então basta juntar com `|`.
 */
const BOT_UA_PATTERN = BOT_UA_MARKS.join("|");

const UA_DE_VISITANTE = sql`(
  coalesce(btrim(${siteVisits.userAgent}), '') <> ''
  and lower(${siteVisits.userAgent}) !~ ${BOT_UA_PATTERN}
)`;

/**
 * País normalizado para sigla ISO minúscula.
 *
 * A coluna não guarda ISO: `geo.ts` passa a sigla do header da Vercel por
 * `Intl.DisplayNames` antes de gravar, e o que sai de lá depende do ICU do
 * runtime — pt-BR ("Estados Unidos") no caso normal, inglês ("United States")
 * em Node com small-icu, a sigla crua quando a conversão falha. A lista de
 * datacenter é escrita em ISO, então a comparação traduz de volta, e as três
 * grafias vêm de `COUNTRY_ALIASES`: é a MESMA tabela que `toCountryCode` usa
 * do lado TypeScript, de propósito. Copiar as grafias para cá faria as duas
 * pontas divergirem no primeiro país novo — e a divergência é silenciosa, só
 * aparece como linha de bot sobrando (ou visitante real sumindo) no card.
 */
const PAIS_BRUTO = sql`lower(btrim(coalesce(${siteVisits.country}, '')))`;

const PAIS_ISO = sql`(case ${sql.join(
  Object.entries(COUNTRY_ALIASES).map(
    (entry) =>
      sql`when ${PAIS_BRUTO} in (${sql.join(
        entry[1].map((alias) => sql`${alias}`),
        sql`, `
      )}) then ${entry[0]}::text`
  ),
  sql` `
)} else ${PAIS_BRUTO} end)`;

const CIDADE = sql`lower(coalesce(btrim(${siteVisits.city}), ''))`;
const REGIAO = sql`lower(coalesce(btrim(${siteVisits.region}), ''))`;

/** `pais|regiao|cidade` da linha, para comparar com a lista de cidades. */
const CHAVE_DE_LOCAL = sql`(${PAIS_ISO} || '|' || ${REGIAO} || '|' || ${CIDADE})`;

/** Mesma chave sem a região, para as entradas que valem em qualquer uma. */
const CHAVE_SEM_REGIAO = sql`(${PAIS_ISO} || '||' || ${CIDADE})`;

const COM_REGIAO = DATACENTER_CITIES.filter((chave) => chave.split("|")[1] !== "");
const SEM_REGIAO = DATACENTER_CITIES.filter((chave) => chave.split("|")[1] === "");

function foraDaLista(chave: SQL, valores: readonly string[]): SQL {
  return sql`${chave} not in (${sql.join(
    valores.map((valor) => sql`${valor}`),
    sql`, `
  )})`;
}

/** País estrangeiro e cidade vazia — assinatura de faixa de datacenter/trânsito. */
const NAO_E_ESTRANGEIRO_SEM_CIDADE = sql`not (
  ${PAIS_ISO} <> '' and ${PAIS_ISO} <> 'br' and ${CIDADE} = ''
)`;

/**
 * Condição para as contagens e listagens de visitante do Hermes: IP público,
 * User-Agent de navegador, fora de cidade-datacenter e não estrangeiro sem
 * cidade.
 */
export const IS_HUMAN_VISIT: SQL = and(
  IP_DE_VISITANTE,
  UA_DE_VISITANTE,
  foraDaLista(CHAVE_DE_LOCAL, COM_REGIAO),
  foraDaLista(CHAVE_SEM_REGIAO, SEM_REGIAO),
  NAO_E_ESTRANGEIRO_SEM_CIDADE
) as SQL;
