import Link from "next/link";
import { getBlogPost } from "@/lib/mdx";

interface RelatedPostsProps {
  slugs: string[];
  /** Slug do post atual, para nunca linkar para ele mesmo. */
  currentSlug: string;
}

export function RelatedPosts({ slugs, currentSlug }: RelatedPostsProps) {
  const posts = slugs
    .filter((s) => s !== currentSlug)
    .map((s) => getBlogPost(s))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  if (!posts.length) return null;

  return (
    <section className="mt-12 rounded-xl border border-ink/8 bg-surface-raised p-6">
      <h2 className="mb-4 text-xl font-bold text-ink">Leia também</h2>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="group block">
              <span className="font-medium text-ink transition group-hover:text-primary">{p.title}</span>
              <span className="mt-0.5 block text-sm text-ink-soft">{p.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
