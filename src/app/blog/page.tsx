import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { getBlogPosts } from "@/lib/mdx";
import { getSeoMetadata } from "@/lib/seo";

export const metadata = getSeoMetadata({
  title: "Blog — Dicas de viagem e eSIM",
  description: "Artigos sobre chip de viagem, eSIM, roaming e internet no exterior para brasileiros.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Blog ChipViagem</h1>
        <p className="mt-2 text-ink-soft">Dicas práticas para viajar conectado pelo mundo.</p>

        <div className="mt-8 space-y-6">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-xl border border-ink/8 bg-surface-raised p-6">
              <time className="text-sm text-ink-soft">{post.date}</time>
              <h2 className="mt-1 text-xl font-semibold text-ink">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-ink-soft">{post.description}</p>
              <div className="mt-3 flex items-center gap-3 text-sm text-ink-soft">
                <span>{post.author}</span>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
