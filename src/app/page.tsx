import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { PlanCard } from "@/components/plan-card";
import { FaqSection, faqJsonLd } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { db } from "@/db";
import { plans, destinations } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSeoMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = getSeoMetadata({
  title: "Chip de viagem (eSIM) com entrega imediata",
  path: "/",
});

const homeFaq = [
  {
    question: "O que é um chip de viagem (eSIM)?",
    answer:
      "É um chip virtual que você instala no celular escaneando um QR code. Não precisa trocar o chip físico — basta ativar antes ou durante a viagem e usar internet no destino.",
  },
  {
    question: "Quanto tempo demora para receber?",
    answer:
      "A entrega é imediata! Após a confirmação do pagamento via Pix, você recebe o QR code do eSIM por e-mail e na página do pedido em poucos minutos.",
  },
  {
    question: "Meu celular é compatível com eSIM?",
    answer:
      "A maioria dos iPhones a partir do XS e smartphones Android recentes (Samsung Galaxy S20+, Google Pixel 3+) suportam eSIM. Verifique nas configurações do seu aparelho se há opção de adicionar plano celular via QR code.",
  },
  {
    question: "Posso usar WhatsApp com o eSIM?",
    answer:
      "Sim! O WhatsApp continua funcionando normalmente com seu número brasileiro. O eSIM fornece apenas dados móveis (internet) no destino.",
  },
  {
    question: "E se eu precisar de ajuda?",
    answer:
      "Nossa equipe de suporte atende em português por e-mail. Estamos prontos para ajudar na instalação e ativação do seu eSIM.",
  },
];

export default async function HomePage() {
  let featuredPlans: (typeof plans.$inferSelect)[] = [];
  let activeDestinations: (typeof destinations.$inferSelect)[] = [];

  try {
    featuredPlans = await db
      .select()
      .from(plans)
      .where(and(eq(plans.isActive, true), eq(plans.isFeatured, true)))
      .orderBy(desc(plans.retailPriceBrl))
      .limit(6);

    if (featuredPlans.length === 0) {
      featuredPlans = await db
        .select()
        .from(plans)
        .where(eq(plans.isActive, true))
        .limit(6);
    }

    activeDestinations = await db
      .select()
      .from(destinations)
      .where(eq(destinations.isActive, true))
      .limit(12);
  } catch {
    // DB not configured yet
  }

  return (
    <PublicLayout>
      <JsonLd data={faqJsonLd(homeFaq)} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold md:text-5xl">
            Chip de viagem com entrega imediata
          </h1>
          <p className="mt-4 text-lg text-sky-100 md:text-xl">
            Conectado em qualquer lugar do mundo. Pague no Pix e receba seu eSIM em minutos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full bg-white/20 px-4 py-2">✓ Entrega imediata</span>
            <span className="rounded-full bg-white/20 px-4 py-2">✓ Pagamento via Pix</span>
            <span className="rounded-full bg-white/20 px-4 py-2">✓ Suporte em português</span>
          </div>
          <Link
            href="/planos"
            className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
          >
            Ver todos os planos
          </Link>
        </div>
      </section>

      {/* Destinos populares */}
      {activeDestinations.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-6 text-2xl font-bold text-ink">Destinos populares</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {activeDestinations.map((dest) => (
              <Link
                key={dest.slug}
                href={`/chip-de-viagem/${dest.slug}`}
                className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:border-primary hover:shadow-md"
              >
                <span className="text-3xl">{dest.flagEmoji}</span>
                <span className="mt-2 text-sm font-medium text-ink">{dest.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Planos em destaque */}
      {featuredPlans.length > 0 && (
        <section className="bg-white px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold text-ink">Planos em destaque</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-ink">Como funciona</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { step: "1", title: "Escolha seu plano", desc: "Selecione o destino e a quantidade de dados ideal para sua viagem." },
            { step: "2", title: "Pague no Pix", desc: "Checkout rápido e seguro. Confirmação em segundos." },
            { step: "3", title: "Escaneie o QR", desc: "Receba o eSIM por e-mail e instale no celular antes de embarcar." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                {item.step}
              </div>
              <h3 className="mt-4 font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/como-funciona" className="text-primary font-medium hover:underline">
            Saiba mais →
          </Link>
        </div>
      </section>

      {/* Prova social */}
      <section className="bg-primary/5 px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-ink">Milhares de brasileiros já viajaram conectados</h2>
          <p className="mt-4 text-slate-600">
            Economize até 90% comparado ao roaming internacional da sua operadora.
            Instale antes de embarcar e chegue no destino com internet funcionando.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <FaqSection items={homeFaq} />
      </section>
    </PublicLayout>
  );
}
