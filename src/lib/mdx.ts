import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  content: string;
  readingTime: string;
  relatedDestinations: string[];
}

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data, content } = matter(raw);
      const wordCount = content.split(/\s+/).length;
      const minutes = Math.ceil(wordCount / 200);

      return {
        slug,
        title: data.title as string,
        description: data.description as string,
        date: data.date as string,
        author: (data.author as string) ?? "Equipe ChipViagem",
        content,
        readingTime: `${minutes} min de leitura`,
        relatedDestinations: (data.relatedDestinations as string[]) ?? [],
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | null {
  return getBlogPosts().find((p) => p.slug === slug) ?? null;
}
