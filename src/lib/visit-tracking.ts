/**
 * Regras de filtro para o rastreamento de visitas (Hermes / dashboard-frank).
 *
 * Sem imports de servidor de propósito: este módulo é usado tanto pelo
 * componente cliente `VisitTracker` (antes de disparar o fetch) quanto pela
 * rota `/api/track/visit` (revalidação do lado do servidor).
 */

const PRIVATE_PREFIXES = ["/admin", "/dashboard", "/api", "/_next", "/painel", "/login"];

const STATIC_FILE_RE = /\.[a-z0-9]{2,5}$/i;

/** true se a rota é pública e deve ser rastreada. */
export function isTrackablePath(pathname: string): boolean {
  if (!pathname || !pathname.startsWith("/")) return false;
  if (PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }
  if (pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return false;
  }
  if (STATIC_FILE_RE.test(pathname)) return false;
  return true;
}

/**
 * Trechos de User-Agent que identificam rastreador conhecido.
 *
 * Todos são substring literal (sem metacaractere de regex), de propósito: a
 * mesma lista vira `BOT_UA_RE` aqui e um `~` do Postgres na leitura
 * (`human-visits.ts`), e as duas versões precisam casar exatamente o mesmo.
 *
 * Os rastreadores do Google que NÃO trazem "bot" no User-Agent estão
 * listados um a um — `(compatible; GoogleOther)` entra como visitante em
 * qualquer filtro que só procure por "bot".
 */
export const BOT_UA_MARKS = [
  "bot",
  "googleother",
  "google-inspectiontool",
  "google-read-aloud",
  "googleweblight",
  "chrome-lighthouse",
  "lighthouse",
  "bytespider",
  "facebookcatalog",
  "facebookexternalhit",
  "crawl",
  "spider",
  "slurp",
  "ia_archiver",
  "headless",
  "python-requests",
  "curl/",
  "wget/",
  "go-http-client",
  "node-fetch",
  "axios",
  "pingdom",
  "uptimerobot",
  "postmanruntime",
  "whatsapp",
  "bingpreview",
  "vercel-screenshot",
] as const;

const BOT_UA_RE = new RegExp(BOT_UA_MARKS.join("|"), "i");

/** true se o User-Agent parece ser um bot/crawler/monitor, não uma visita real. */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent || !userAgent.trim()) return true;
  return BOT_UA_RE.test(userAgent);
}

/** Endereço de rede local ou privada — visita minha ou da infra, não de visitante. */
export function isPrivateIp(ip: string | null | undefined): boolean {
  const value = ip?.trim();
  if (!value) return true;
  const bare = value.replace(/^::ffff:/i, "");
  return (
    bare === "::1" ||
    bare.startsWith("127.") ||
    bare.startsWith("10.") ||
    bare.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(bare)
  );
}

/**
 * Nomes que a coluna `country` pode ter para o mesmo país.
 *
 * `getLocationFromHeaders` (geo.ts) passa a sigla ISO do header da Vercel por
 * `Intl.DisplayNames("pt-BR")` antes de gravar — o banco guarda "Estados
 * Unidos", não "US". A lista de datacenter é escrita em ISO, então a
 * comparação precisa aceitar as duas grafias (e o histórico já gravado, caso
 * alguma linha antiga tenha entrado com a sigla).
 */
export const COUNTRY_ALIASES: Readonly<Record<string, readonly string[]>> = {
  br: ["br", "bra", "brasil", "brazil"],
  us: ["us", "usa", "estados unidos", "united states"],
  ca: ["ca", "can", "canadá", "canada"],
  de: ["de", "deu", "alemanha", "germany"],
};

const CODE_BY_ALIAS = new Map<string, string>(
  Object.entries(COUNTRY_ALIASES).flatMap(([code, aliases]) =>
    aliases.map((alias) => [alias, code] as const)
  )
);

/** Sigla ISO minúscula do país gravado; devolve o próprio texto se for desconhecido. */
export function toCountryCode(country: string | null | undefined): string {
  const value = country?.trim().toLowerCase() ?? "";
  if (!value) return "";
  return CODE_BY_ALIAS.get(value) ?? value;
}

/**
 * Cidades quase inteiramente ocupadas por datacenter de nuvem — não "cidade
 * grande que também tem datacenter" (essas ficam de fora: o risco de marcar
 * gente real como rastreador é alto demais). A Vercel não manda ASN nem
 * provedor no header de geolocalização, só localização, então isto é o que dá
 * para inferir sem serviço externo.
 *
 * Formato da chave: `pais|regiao|cidade`, tudo minúsculo e o país em ISO.
 * Região vazia vale como "qualquer região" — a Vercel nem sempre manda o
 * código da região, e entrada que só casa com região preenchida não serviria
 * justamente nos registros que motivaram esta lista.
 */
export const DATACENTER_CITIES = [
  "us|va|ashburn",
  "us|va|reston",
  "us|va|sterling",
  "us|or|boardman",
  "us|or|the dalles",
  "us|ia|council bluffs",
  "us|nj|north bergen",
  "us|ny|nanuet",
  "ca|qc|beauharnois",
  // Vila de ~4.500 habitantes onde fica o parque de servidores da Hetzner.
  "de||falkenstein",
] as const;

const DATACENTER_KEYS: ReadonlySet<string> = new Set(DATACENTER_CITIES);

/** true se a localização gravada é uma cidade-datacenter conhecida. */
export function isDatacenterLocation(
  city: string | null | undefined,
  region: string | null | undefined,
  country: string | null | undefined
): boolean {
  const cidade = city?.trim().toLowerCase() ?? "";
  const pais = toCountryCode(country);
  if (!cidade || !pais) return false;
  const regiao = region?.trim().toLowerCase() ?? "";
  return DATACENTER_KEYS.has(`${pais}|${regiao}|${cidade}`) || DATACENTER_KEYS.has(`${pais}||${cidade}`);
}

/**
 * Acesso de fora do Brasil que chegou sem cidade nenhuma.
 *
 * A Vercel resolve cidade para acesso residencial normal — operadora de banda
 * larga e de celular estão nas bases de geolocalização. Faixa de datacenter e
 * de trânsito, não: sobra o país e mais nada. O corte para no Brasil de
 * propósito: visitante brasileiro sem cidade existe (CGNAT de operadora
 * móvel) e o público deste site é brasileiro.
 */
export function isForeignWithoutCity(
  city: string | null | undefined,
  country: string | null | undefined
): boolean {
  const pais = toCountryCode(country);
  if (!pais || pais === "br") return false;
  return !city?.trim();
}

/** Reúne as regras de descarte que valem na gravação da visita. */
export function isMachineVisit(input: {
  ip: string | null | undefined;
  userAgent: string | null | undefined;
  city: string | null | undefined;
  region: string | null | undefined;
  country: string | null | undefined;
}): boolean {
  return (
    isPrivateIp(input.ip) ||
    isBotUserAgent(input.userAgent) ||
    isDatacenterLocation(input.city, input.region, input.country) ||
    isForeignWithoutCity(input.city, input.country)
  );
}
