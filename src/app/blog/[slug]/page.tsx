import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PublicLayout } from "@/components/layout/public-layout";
import { JsonLd } from "@/components/json-ld";
import { RelatedDestinations } from "@/components/blog-related-destinations";
import { RelatedPosts } from "@/components/blog-related-posts";
import { getBlogPost, getBlogPosts } from "@/lib/mdx";
import { getSeoMetadata, getSiteUrl, breadcrumbJsonLd } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// As datas do frontmatter sao dia sem hora. Formatar em UTC: em
// America/Sao_Paulo a meia-noite UTC volta um dia.
const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatarData(iso: string) {
  return formatoData.format(new Date(iso));
}

export async function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return getSeoMetadata({ noIndex: true });
  return getSeoMetadata({
    // seoTitle cai para title quando nao definido no frontmatter
    title: post.seoTitle,
    description: post.description,
    path: `/blog/${slug}`,
    article: { publishedTime: post.date, modifiedTime: post.updated ?? post.date },
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
  const atualizado = post.updated && post.updated !== post.date ? post.updated : null;

  const pageUrl = `${getSiteUrl()}/blog/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    // So muda quando o corpo do post muda (campo `updated`), nao a cada ajuste
    // de frontmatter. Data de atualizacao falsa e sinal que o Google ignora.
    dateModified: post.updated ?? post.date,
    image: `${getSiteUrl()}/opengraph-image`,
    url: pageUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    // "Equipe ChipViagem" e a equipe, nao uma pessoa.
    author: { "@type": "Organization", name: post.author, url: getSiteUrl() },
    publisher: {
      "@type": "Organization",
      name: "ChipViagem",
      url: getSiteUrl(),
    },
  };

  return (
    <PublicLayout>
      <JsonLd
        data={[
          jsonLd,
          breadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${slug}` },
          ]),
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_250px]">
          <article className="min-w-0">
            <Link href="/blog" className="text-sm text-primary hover:underline">← Voltar ao blog</Link>
            <header className="mt-4">
              <p className="text-sm text-ink-soft">
                <time dateTime={post.date}>{formatarData(post.date)}</time>
                {atualizado && (
                  <>
                    {" · Atualizado em "}
                    <time dateTime={atualizado}>{formatarData(atualizado)}</time>
                  </>
                )}
              </p>
              <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">{post.title}</h1>
              <p className="mt-2 text-ink-soft">{post.description}</p>
              <p className="mt-2 text-sm text-ink-soft">{post.author} · {post.readingTime}</p>
            </header>
            <div className="prose prose-slate mt-8 max-w-none">
              <MDXRemote source={post.content} />
            </div>

            <RelatedDestinations slugs={post.relatedDestinations} />
            <RelatedPosts slugs={post.relatedPosts} currentSlug={slug} />
          </article>

          {headings.length > 0 && (
            <aside className="hidden lg:block">
              <nav className="sticky top-20 rounded-lg border border-ink/8 bg-surface-raised p-4">
                <h2 className="mb-3 text-sm font-semibold text-ink">Neste artigo</h2>
                <ul className="space-y-2 text-sm">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
                      <a href={`#${h.id}`} className="text-ink-soft hover:text-primary">
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
