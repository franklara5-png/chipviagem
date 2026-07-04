import type { MetadataRoute } from "next";
import { db } from "@/db";
import { destinations, plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getBlogPosts } from "@/lib/mdx";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPages = [
    "", "/planos", "/como-funciona", "/suporte", "/blog", "/termos", "/privacidade",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  let destPages: MetadataRoute.Sitemap = [];
  let planPages: MetadataRoute.Sitemap = [];

  try {
    const dests = await db.select().from(destinations).where(eq(destinations.isActive, true));
    destPages = dests.map((d) => ({
      url: `${base}/chip-de-viagem/${d.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    const activePlans = await db.select().from(plans).where(eq(plans.isActive, true));
    planPages = activePlans.map((p) => ({
      url: `${base}/checkout/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB not configured
  }

  const blogPages = getBlogPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...destPages, ...planPages, ...blogPages];
}
