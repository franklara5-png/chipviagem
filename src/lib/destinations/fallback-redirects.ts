/**
 * Destino de fallback para os slugs que o blog linka e que ainda nao existem
 * na tabela `destinations`.
 *
 * POR QUE ISSO EXISTE
 *
 * O corpo dos posts tem 74 links para /chip-de-viagem/<slug>, cobrindo os 17
 * slugs abaixo. Com o catalogo vazio, a rota chamava notFound() e os 74 links
 * respondiam 404. Num dominio novo o orcamento de rastreamento e o recurso
 * escasso, e o Search Console de 11/09/2026 mostrava o efeito: 2 paginas ja
 * classificadas como "Nao encontrado (404)" e 21 como "Detectada, mas nao
 * indexada" - ou seja, o Google descobriu paginas e nao gastou rastreio nelas.
 *
 * Enquanto o catalogo nao e populado, cada slug aqui responde 307 (temporario)
 * para o conteudo equivalente que EXISTE hoje no blog.
 *
 * POR QUE 307 E NAO 308
 *
 * A URL nao mudou de lugar: ela ainda nao existe. permanentRedirect (308)
 * diria ao Google que /chip-de-viagem/<slug> foi substituida para sempre, e
 * isso e falso - ela volta assim que houver catalogo.
 *
 * COMO ISSO SE DESFAZ SOZINHO
 *
 * O mapa so e consultado quando o destino NAO esta no banco. Populado o
 * catalogo, a pagina volta a renderizar normalmente e este arquivo fica
 * inerte, sem precisar de remocao.
 *
 * ATENCAO AO EDITAR O BLOG
 *
 * Link novo para um slug fora deste mapa volta a responder 404. Ao citar um
 * destino novo no conteudo, ou acrescente a entrada aqui, ou aponte o link
 * direto para o post.
 */
export const FALLBACK_REDIRECTS: Record<string, string> = {
  alemanha: "/blog/chip-viagem-alemanha",
  argentina: "/blog/chip-viagem-argentina",
  chile: "/blog/chip-viagem-chile",
  cuba: "/blog/chip-viagem-cuba",
  espanha: "/blog/chip-viagem-espanha",
  eua: "/blog/chip-viagem-estados-unidos",
  europa: "/blog/chip-de-viagem-europa-guia",
  franca: "/blog/chip-viagem-franca",
  italia: "/blog/chip-viagem-italia",
  japao: "/blog/internet-no-japao",
  mexico: "/blog/chip-viagem-mexico",
  portugal: "/blog/chip-viagem-portugal",
  suica: "/blog/chip-viagem-suica",
  tailandia: "/blog/chip-viagem-tailandia",

  // Punta Cana fica na Republica Dominicana; e o post que cobre o destino.
  "republica-dominicana": "/blog/chip-viagem-punta-cana",

  // Sem post proprio: caem no conteudo mais proximo da intencao.
  global: "/blog/melhores-esim-viagem-comparativo",
  panama: "/blog/melhor-chip-viagem-internacional",
};
