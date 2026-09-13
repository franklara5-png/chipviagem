import type { Metadata } from "next";

/** Domínio canônico de produção — nunca usar .vercel.app em SEO. */
export const PRODUCTION_SITE_URL = "https://chipviagem.com.br";

const SITE_NAME = "ChipViagem";
const DEFAULT_DESCRIPTION =
  "Compre chip de viagem (eSIM) com entrega imediata. Pagamento via Pix, suporte em português. Conectado em qualquer lugar do mundo.";

/**
 * Resolve a URL pública do site.
 * Em produção (ou se a env apontar para vercel.app), força o domínio canônico.
 * Em local/preview com localhost, mantém a env para links de e-mail/dev.
 */
function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
  const isVercelApp = raw.includes("vercel.app");
  const isLocalhost = /localhost|127\.0\.0\.1/.test(raw);
  const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

  if (!raw || isVercelApp || (isProduction && isLocalhost)) {
    return PRODUCTION_SITE_URL;
  }
  return raw;
}

const SITE_URL = resolveSiteUrl();

export interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  /**
   * Só informe para sobrescrever a imagem padrão. Deixando vazio, usa a imagem
   * de `app/opengraph-image.tsx` EXPLICITAMENTE. Nao da para contar com a
   * heranca da convencao de arquivo: como este helper sempre devolve um objeto
   * `openGraph`, ele substitui o da raiz e a imagem sumia de todas as paginas
   * menos da home (achado em 12/09/2026: posts compartilhados sem imagem).
   */
  ogImage?: string;
  noIndex?: boolean;
  /** Posts do blog: vira og:type article com as datas de publicacao e de
   * ultima mudanca de conteudo. */
  article?: { publishedTime: string; modifiedTime?: string };
}

export function getSeoMetadata(options: SeoOptions = {}): Metadata {
  const { title, description = DEFAULT_DESCRIPTION, path = "", ogImage, noIndex = false, article } = options;

  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Conectado em qualquer lugar do mundo.`;
  const canonical = `${SITE_URL}${path}`;
  const images = ogImage
    ? [
        {
          url: ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ]
    : [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: SITE_NAME }];

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "pt_BR",
      ...(article
        ? {
            type: "article" as const,
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime ?? article.publishedTime,
          }
        : { type: "website" as const }),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function getSiteUrl(): string {
  return SITE_URL;
}

export { SITE_NAME, DEFAULT_DESCRIPTION };

/**
 * Identidade da marca para o Google. Vai só na home — repetir Organization em
 * toda página não ajuda e polui. Dados conferem com o rodapé do site.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: "Altivia",
    taxID: "63.101.423/0001-18",
    url: SITE_URL,
    // Minimo do Google para logo de Organization: 112x112. O /icon tem 96x96
    // (tamanho de favicon); o /apple-icon tem 180x180.
    logo: `${SITE_URL}/apple-icon`,
    image: `${SITE_URL}/opengraph-image`,
    description: DEFAULT_DESCRIPTION,
    areaServed: "BR",
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Trilha de navegação — o Google usa para mostrar o caminho no lugar da URL crua. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
