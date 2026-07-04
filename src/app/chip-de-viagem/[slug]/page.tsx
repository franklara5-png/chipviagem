import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { PlanCard } from "@/components/plan-card";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { RelatedGuides, faqJsonLd } from "@/components/destination-related-guides";
import { db } from "@/db";
import { destinations, plans } from "@/db/schema";
import { getPlanFilterForDestination } from "@/lib/destinations/plan-filter";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getSeoMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const dests = await db
      .select({ slug: destinations.slug })
      .from(destinations)
      .where(eq(destinations.isActive, true));
    return dests.map((d) => ({ slug: d.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const [dest] = await db
      .select()
      .from(destinations)
      .where(eq(destinations.slug, slug))
      .limit(1);
    if (!dest) return getSeoMetadata({ noIndex: true });
    const description = dest.intro
      ? dest.intro.slice(0, 155).replace(/\n/g, " ") + "…"
      : dest.heroText;
    return getSeoMetadata({
      title: `Chip de viagem para ${dest.name} (eSIM)`,
      description,
      path: `/chip-de-viagem/${slug}`,
    });
  } catch {
    return getSeoMetadata({ noIndex: true });
  }
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;

  const [dest] = await db
    .select()
    .from(destinations)
    .where(and(eq(destinations.slug, slug), eq(destinations.isActive, true)))
    .limit(1);

  if (!dest) notFound();

  const planFilter = getPlanFilterForDestination(dest.countryCode);
  const countryPlans = planFilter
    ? await db.select().from(plans).where(planFilter)
    : [];

  const productJsonLd = countryPlans.map((plan) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: plan.name,
    description: `eSIM ${plan.name} — ${plan.dataAmountMb}MB por ${plan.validityDays} dias`,
    offers: {
      "@type": "Offer",
      price: plan.retailPriceBrl,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
  }));

  const faqLd = dest.faqJson?.length ? faqJsonLd(dest.faqJson) : null;
  const jsonLd = faqLd ? [...productJsonLd, faqLd] : productJsonLd;

  const introParagraphs = dest.intro?.split("\n\n").filter(Boolean) ?? [];

  return (
    <PublicLayout>
      <JsonLd data={jsonLd} />

      <section className="bg-gradient-to-br from-primary to-primary-dark px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <span className="text-4xl">{dest.flagEmoji}</span>
          <h1 className="mt-4 text-3xl font-bold md:text-4xl">
            Chip de viagem para {dest.name} (eSIM)
          </h1>
          <p className="mt-4 text-lg text-sky-100">{dest.heroText}</p>
        </div>
      </section>

      {introParagraphs.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-10">
          <h2 className="mb-4 text-2xl font-bold text-ink">
            Internet móvel em {dest.name}: o que você precisa saber
          </h2>
          <div className="prose prose-slate max-w-none space-y-4 text-slate-700">
            {introParagraphs.map((p, i) => (
              <p key={i} className="leading-relaxed">{p}</p>
            ))}
          </div>
        </section>
      )}

      {dest.tipsJson && dest.tipsJson.length > 0 && (
        <section className="bg-white px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold text-ink">
              Dicas práticas para viajar para {dest.name}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {dest.tipsJson.map((tip, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-ink">{tip.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{tip.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-ink">Planos disponíveis</h2>
          <Link
            href={`/quantos-gb-preciso?destino=${slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Não sabe quanto contratar? Use a calculadora →
          </Link>
        </div>
        {countryPlans.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countryPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <p className="text-slate-600">
            Nenhum plano ativo para este destino no momento.{" "}
            <a href="/planos" className="text-primary hover:underline">Veja todos os planos</a>.
          </p>
        )}
      </section>

      <RelatedGuides
        slugs={dest.relatedPostSlugs ?? []}
        destinationName={dest.name}
      />

      <section className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-4 text-2xl font-bold text-ink">Como ativar seu eSIM</h2>
        <ol className="list-decimal space-y-3 pl-5 text-slate-600">
          <li>Compre o plano e receba o QR code por e-mail após o pagamento.</li>
          <li>No iPhone: Ajustes → Celular → Adicionar eSIM → Usar QR Code.</li>
          <li>No Android: Configurações → Rede → SIM → Adicionar eSIM → Escanear QR.</li>
          <li>Ative o eSIM ao chegar no destino ou antes de embarcar (recomendado).</li>
          <li>Desative dados móveis do chip brasileiro para evitar roaming.</li>
        </ol>
      </section>

      {dest.faqJson && dest.faqJson.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 pb-16">
          <FaqSection items={dest.faqJson} title={`Perguntas frequentes — ${dest.name}`} />
        </section>
      )}
    </PublicLayout>
  );
}
