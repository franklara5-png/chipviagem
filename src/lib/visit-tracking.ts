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

const BOT_UA_RE =
  /bot|spider|crawl|slurp|headless|lighthouse|pingdom|uptimerobot|ahrefsbot|semrushbot|mj12bot|dotbot|python-requests|curl\/|wget\/|go-http-client|node-fetch|postmanruntime|facebookexternalhit|whatsapp|telegrambot|discordbot|bingpreview|vercel-screenshot|axios\//i;

/** true se o User-Agent parece ser um bot/crawler/monitor, não uma visita real. */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent || !userAgent.trim()) return true;
  return BOT_UA_RE.test(userAgent);
}
