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
        <h1 className="text-3xl font-bold text-ink">Blog ChipViagem</h1>
        <p className="mt-2 text-slate-600">Dicas práticas para viajar conectado pelo mundo.</p>

        <div className="mt-8 space-y-6">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-xl border border-slate-200 bg-white p-6">
              <time className="text-sm text-slate-500">{post.date}</time>
              <h2 className="mt-1 text-xl font-semibold text-ink">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-slate-600">{post.description}</p>
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
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
