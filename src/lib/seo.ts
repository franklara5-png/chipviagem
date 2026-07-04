import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chipviagem.com.br";
const SITE_NAME = "ChipViagem";
const DEFAULT_DESCRIPTION =
  "Compre chip de viagem (eSIM) com entrega imediata. Pagamento via Pix, suporte em português. Conectado em qualquer lugar do mundo.";

export interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function getSeoMetadata(options: SeoOptions = {}): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    path = "",
    ogImage = "/og-image.png",
    noIndex = false,
    jsonLd,
  } = options;

  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Conectado em qualquer lugar do mundo.`;
  const canonical = `${SITE_URL}${path}`;

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
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    other: jsonLd
      ? { "script:ld+json": JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]) }
      : undefined,
  };
}

export function getSiteUrl(): string {
  return SITE_URL;
}

export { SITE_NAME, DEFAULT_DESCRIPTION };
