import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

/**
 * Robô de busca do Baidu (China). Em 19/10/2026 lia os sites todo dia com uns 20
 * IPs novos (faixa 116.179.x, Shanxi) e nenhum cliente vem da China: só inflava
 * as visitas. O Baidu obedece robots.txt.
 */
const BAIDU = {
  userAgent: ["Baiduspider", "Baiduspider-render", "Baiduspider-image"],
  disallow: "/",
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }, BAIDU],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
