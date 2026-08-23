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
   * Só informe para sobrescrever a imagem padrão. Deixando vazio, o Next usa
   * a convenção de arquivo `app/opengraph-image.tsx`, que gera a imagem e
   * emite og:image/twitter:image automaticamente.
   */
  ogImage?: string;
  noIndex?: boolean;
}

export function getSeoMetadata(options: SeoOptions = {}): Metadata {
  const { title, description = DEFAULT_DESCRIPTION, path = "", ogImage, noIndex = false } = options;

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
    : undefined;

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
      type: "website",
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
