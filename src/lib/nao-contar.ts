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

/** Página de confirmação de /api/nao-contar. Sem estilo inline: há site com CSP. */
export function htmlNaoContar(site: string, desfazer: boolean): string {
  const corpo = desfazer
    ? `<h1>Voltou a contar</h1>
<p>Este aparelho volta a entrar na contagem de visitas do ${site}.</p>
<p><a href="?">Não contar de novo</a></p>`
    : `<h1>Pronto</h1>
<p>Este aparelho não entra mais na contagem de visitas do ${site}, em qualquer rede: Wi-Fi ou 4G.</p>
<p>Vale por 400 dias neste navegador. Limpar os cookies desfaz.</p>
<p><a href="?desfazer=1">Voltar a contar este aparelho</a></p>`;
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${site}: não contar este aparelho</title></head>
<body>
${corpo}
</body></html>`;
}
