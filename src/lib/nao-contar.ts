/**
 * "Este aparelho é do Frank: não conte."
 *
 * Abrir /api/nao-contar grava o cookie `nao_contar` neste navegador, e o
 * rastreador de visitas deixa de gravar o que vier dele, em qualquer rede
 * (Wi-Fi de casa, 4G, viagem). A aba Sites do dashboard tem os links de todos
 * os sites, para abrir uma vez em cada aparelho.
 *
 * IPS_NAO_CONTAR (variável da Vercel, separada por vírgula) é o reforço: pega
 * o navegador que ainda não recebeu o cookie e tira das contagens o que foi
 * gravado antes dele. Item terminado em ":" é prefixo IPv6 e vale para a rede
 * inteira de casa, onde cada aparelho ganha um endereço diferente. O IP de
 * casa muda quando o roteador reinicia — por isso o cookie é o principal.
 *
 * Quem não é o Frank e abrir o link só deixa de ser contado. Não dá acesso a
 * nada.
 */
export const COOKIE_NAO_CONTAR = "nao_contar";

/** O Chrome não aceita validade maior que 400 dias. */
export const VALIDADE_NAO_CONTAR_S = 400 * 24 * 60 * 60;

export function listaIpsNaoContar(valor = process.env.IPS_NAO_CONTAR): string[] {
  return (valor ?? "")
    .split(",")
    .map((ip) => ip.trim().toLowerCase())
    .filter(Boolean);
}

export function ipNaoConta(
  ip: string | null | undefined,
  lista: string[] = listaIpsNaoContar(),
): boolean {
  const v = (ip ?? "").trim().toLowerCase().replace(/^::ffff:/, "");
  if (!v) return false;
  return lista.some((item) => (item.endsWith(":") ? v.startsWith(item) : v === item));
}

/** Recebe o cabeçalho Cookie cru. */
export function temCookieNaoContar(cookie: string | null | undefined): boolean {
  return /(?:^|;\s*)nao_contar=1(?:;|$)/.test(cookie ?? "");
}

/** Veredito da gravação: cookie do aparelho ou IP da lista. */
export function naoContarVisita(headers: Headers, ip: string | null | undefined): boolean {
  return temCookieNaoContar(headers.get("cookie")) || ipNaoConta(ip);
}

/**
 * Página de confirmação de /api/nao-contar, no visual escuro do dashboard.
 * `nonce` vem do cabeçalho x-nonce quando o site tem CSP com nonce (a
 * AltiviaClinica tem); sem ele, o <style> seria bloqueado.
 */
export function htmlNaoContar(site: string, desfazer: boolean, nonce?: string | null): string {
  const atributoNonce = nonce ? ` nonce="${nonce.replace(/[^A-Za-z0-9+/=]/g, "")}"` : "";
  const icone = desfazer
    ? `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`
    : `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
  const titulo = desfazer ? "Voltou a contar" : "Pronto";
  const texto = desfazer
    ? `Este aparelho volta a entrar na contagem de visitas do <b>${site}</b>.`
    : `Este aparelho não entra mais na contagem de visitas do <b>${site}</b>, em qualquer rede: Wi-Fi ou 4G.`;
  const detalhe = desfazer ? "" : `<p class="detalhe">Vale por 400 dias neste navegador. Limpar os cookies desfaz.</p>`;
  const link = desfazer
    ? `<a href="?">Não contar de novo</a>`
    : `<a href="?desfazer=1">Voltar a contar este aparelho</a>`;

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="dark">
<title>${site}: ${desfazer ? "voltou a contar" : "não contar este aparelho"}</title>
<style${atributoNonce}>
*{box-sizing:border-box;margin:0}
html,body{height:100%}
body{display:flex;align-items:center;justify-content:center;padding:16px;background:#09090b;color:#e4e4e7;font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.cartao{width:100%;max-width:380px;padding:28px 24px;border:1px solid rgba(255,255,255,.07);border-radius:20px;background:linear-gradient(180deg,#18181b,#111113);box-shadow:0 20px 50px rgba(0,0,0,.45);text-align:center}
.icone{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;margin-bottom:16px;border-radius:999px;color:${desfazer ? "#a5b4fc" : "#34d399"};background:${desfazer ? "rgba(129,140,248,.12)" : "rgba(16,185,129,.12)"};box-shadow:0 0 0 1px ${desfazer ? "rgba(129,140,248,.25)" : "rgba(16,185,129,.25)"} inset}
.site{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#71717a}
h1{margin:4px 0 8px;font-size:22px;font-weight:700;color:#fafafa}
p{color:#a1a1aa}
b{color:#e4e4e7;font-weight:600}
.detalhe{margin-top:10px;font-size:13px;color:#71717a}
a{display:inline-block;margin-top:20px;font-size:13px;color:#71717a;text-decoration:underline;text-underline-offset:3px}
a:hover{color:#d4d4d8}
</style></head>
<body>
<main class="cartao">
<div class="icone">${icone}</div>
<div class="site">${site}</div>
<h1>${titulo}</h1>
<p>${texto}</p>
${detalhe}
${link}
</main>
</body></html>`;
}
