import Link from "next/link";
import { FaqSection, faqJsonLd } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { getBlogPost } from "@/lib/mdx";

interface RelatedGuidesProps {
  slugs: string[];
  destinationName: string;
}

export function RelatedGuides({ slugs, destinationName }: RelatedGuidesProps) {
  const posts = slugs.map((s) => getBlogPost(s)).filter(Boolean);

  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="mb-4 text-2xl font-bold text-ink">Guias relacionados</h2>
      <p className="mb-4 text-slate-600">
        Artigos úteis para quem vai viajar para {destinationName}:
      </p>
      <ul className="space-y-3">
        {posts.map((post) => post && (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-primary hover:shadow-sm"
            >
              <span className="font-medium text-ink hover:text-primary">{post.title}</span>
              <p className="mt-1 text-sm text-slate-500">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { faqJsonLd };
