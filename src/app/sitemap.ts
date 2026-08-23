import type { MetadataRoute } from "next";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getBlogPosts } from "@/lib/mdx";
import { getSiteUrl } from "@/lib/seo";

/**
 * O sitemap é um Route Handler cacheado por build. Sem revalidate, popular o
 * banco (db:seed) não faria as páginas de destino aparecerem até o próximo
 * deploy. 1h é o suficiente.
 */
export const revalidate = 3600;

/**
 * NÃO incluir aqui:
 * - /checkout/*        → conteúdo fino e duplicado, não deve ser indexado
 * - /pedido/*, /painel → dados de cliente
 * - /login, /admin/*   → sem valor de busca
 */
const STATIC_PATHS = [
  "",
  "/planos",
  "/quantos-gb-preciso",
  "/como-funciona",
  "/suporte",
  "/blog",
  "/chip-internacional",
  "/esim-brasil",
  "/comparativo-chip-viagem",
  "/termos",
  "/privacidade",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  let destPages: MetadataRoute.Sitemap = [];
  try {
    const dests = await db
      .select({ slug: destinations.slug })
      .from(destinations)
      .where(eq(destinations.isActive, true));

    destPages = dests.map((d) => ({
      url: `${base}/chip-de-viagem/${d.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    if (destPages.length === 0) {
      // Silenciar isso já custou as 62 landing pages de destino ficarem fora
      // do sitemap sem ninguém notar. Se zerar de novo, aparece no log.
      console.error("[sitemap] Nenhum destino ativo no banco — o sitemap saiu sem as páginas /chip-de-viagem/*.");
    }
  } catch (error) {
    console.error("[sitemap] Falha ao carregar destinos do banco:", error);
  }

  const blogPages: MetadataRoute.Sitemap = getBlogPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...destPages, ...blogPages];
}
