import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PublicLayout } from "@/components/layout/public-layout";
import { JsonLd } from "@/components/json-ld";
import { RelatedDestinations } from "@/components/blog-related-destinations";
import { getBlogPost, getBlogPosts } from "@/lib/mdx";
import { getSeoMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return getSeoMetadata({ noIndex: true });
  return getSeoMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${slug}`,
  });
}

function extractHeadings(content: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const text = match[2];
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    headings.push({ id, text, level: match[1].length });
  }
  return headings;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "ChipViagem" },
  };

  return (
    <PublicLayout>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_250px]">
          <article className="min-w-0">
            <Link href="/blog" className="text-sm text-primary hover:underline">← Voltar ao blog</Link>
            <header className="mt-4">
              <time className="text-sm text-slate-500">{post.date}</time>
              <h1 className="mt-2 text-3xl font-bold text-ink md:text-4xl">{post.title}</h1>
              <p className="mt-2 text-slate-600">{post.description}</p>
              <p className="mt-2 text-sm text-slate-500">{post.author} · {post.readingTime}</p>
            </header>
            <div className="prose prose-slate mt-8 max-w-none">
              <MDXRemote source={post.content} />
            </div>

            <RelatedDestinations slugs={post.relatedDestinations} />
          </article>

          {headings.length > 0 && (
            <aside className="hidden lg:block">
              <nav className="sticky top-20 rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-ink">Neste artigo</h2>
                <ul className="space-y-2 text-sm">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
                      <a href={`#${h.id}`} className="text-slate-600 hover:text-primary">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
