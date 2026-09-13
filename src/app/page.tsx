import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { PlanCard } from "@/components/plan-card";
import { FaqSection, faqJsonLd } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { db } from "@/db";
import { plans, destinations } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { getApprovedReviews } from "@/lib/reviews";
import { getSeoMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { Hero3DCard } from "@/components/hero-3d";

// ISR: a pagina e pre-renderizada e revalidada de hora em hora.
// force-dynamic desligava todo o cache e ainda anulava o generateStaticParams.
export const revalidate = 3600;

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

// Guias de destino linkados direto da home. A home e a pagina que o Google
// mais rastreia; sem link dela, os posts dependiam so do sitemap e do /blog,
// e em 12/09/2026 havia 21 URLs em "Detectada, mas nao indexada".
// Lista estatica de proposito: ler content/blog em runtime numa pagina ISR
// depende do tracing do bundle e pode voltar vazio so em producao.
const destinationGuides = [
  { slug: "chip-viagem-argentina", name: "Argentina", flag: "🇦🇷" },
  { slug: "chip-viagem-portugal", name: "Portugal", flag: "🇵🇹" },
  { slug: "chip-viagem-estados-unidos", name: "Estados Unidos", flag: "🇺🇸" },
  { slug: "chip-viagem-chile", name: "Chile", flag: "🇨🇱" },
  { slug: "chip-de-viagem-europa-guia", name: "Europa", flag: "🇪🇺" },
  { slug: "chip-viagem-italia", name: "Itália", flag: "🇮🇹" },
  { slug: "chip-viagem-franca", name: "França", flag: "🇫🇷" },
  { slug: "chip-viagem-espanha", name: "Espanha", flag: "🇪🇸" },
  { slug: "chip-viagem-mexico", name: "México", flag: "🇲🇽" },
  { slug: "chip-viagem-uruguai", name: "Uruguai", flag: "🇺🇾" },
  { slug: "internet-no-japao", name: "Japão", flag: "🇯🇵" },
  { slug: "chip-viagem-dubai", name: "Dubai", flag: "🇦🇪" },
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

  const approvedReviews = await getApprovedReviews({ limit: 8 }).catch(() => []);

  return (
    <PublicLayout>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(homeFaq)]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-deep px-4 pb-20 pt-16 text-white md:pb-28 md:pt-20">
        {/* Chão em fuga — horizonte, não textura. */}
        <div className="grid-floor pointer-events-none absolute inset-x-0 bottom-0 h-72 opacity-70" />
        {/* Massas de cor à deriva atrás de tudo. */}
        <div className="animate-drift pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-accent opacity-25 blur-[110px]" />
        <div
          className="animate-drift pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-primary opacity-30 blur-[120px]"
          style={{ animationDelay: "-8s" }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="animate-rise text-center md:text-left">
            <span className="glass backdrop-blur-xl backdrop-saturate-150 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/85">
              eSIM · entrega em minutos
            </span>

            <h1 className="font-display mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
              Desembarque
              <br />
              <span className="text-gradient">já conectado.</span>
            </h1>

            <p className="mt-5 max-w-md text-lg text-white/65 md:text-xl">
              Chip de viagem digital para usar internet no exterior. Pague no Pix, escaneie o QR
              code e chegue com internet funcionando.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                href="/planos"
                className="rounded-xl bg-[image:var(--brand-gradient)] px-7 py-4 text-base font-bold text-white shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
              >
                Ver todos os planos
              </Link>
              <Link
                href="/quantos-gb-preciso"
                className="glass backdrop-blur-xl backdrop-saturate-150 rounded-xl px-7 py-4 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Quantos GB eu preciso?
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/55 md:justify-start">
              {["Entrega imediata", "Pagamento via Pix", "Suporte em português"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-accent" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <Hero3DCard />
        </div>
      </section>

      {/* Destinos populares */}
      {activeDestinations.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display mb-7 text-3xl font-extrabold text-ink">
            Destinos populares
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {activeDestinations.map((dest) => (
              <Link
                key={dest.slug}
                href={`/chip-de-viagem/${dest.slug}`}
                className="tilt-3d flex flex-col items-center rounded-2xl border border-ink/6 bg-surface-raised p-5 text-center shadow-[var(--shadow-lift)]"
              >
                <span className="text-3xl">{dest.flagEmoji}</span>
                <span className="mt-2 text-sm font-semibold text-ink">{dest.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Calculadora GB */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-3xl border border-ink/6 bg-surface-raised p-9 shadow-[var(--shadow-lift)] md:flex md:items-center md:justify-between md:gap-8">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-15 blur-[70px]"
            style={{ background: "var(--brand-gradient)" }}
          />
          <div className="relative md:max-w-lg">
            <h2 className="font-display text-3xl font-extrabold text-ink">
              Não sabe quantos GB contratar?
            </h2>
            <p className="mt-3 text-ink-soft">
              Informe os dias de viagem e seus hábitos de uso. A calculadora devolve uma
              estimativa com margem de segurança e já sugere os planos que servem.
            </p>
          </div>
          <Link
            href="/quantos-gb-preciso"
            className="relative mt-7 inline-block rounded-xl bg-[image:var(--brand-gradient)] px-8 py-4 font-bold text-white shadow-[0_8px_24px_rgba(199,75,158,0.26)] transition-transform hover:-translate-y-0.5 md:mt-0 md:shrink-0"
          >
            Calcular meus GB
          </Link>
        </div>
      </section>

      {/* Guias por destino */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-extrabold text-ink">
            Guias de internet por destino
          </h2>
          <Link
            href="/blog"
            className="font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            Ver todos os guias →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {destinationGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/blog/${guide.slug}`}
              className="tilt-3d flex flex-col items-center rounded-2xl border border-ink/6 bg-surface-raised p-5 text-center shadow-[var(--shadow-lift)]"
            >
              <span className="text-3xl" aria-hidden="true">
                {guide.flag}
              </span>
              <span className="mt-2 text-sm font-semibold text-ink">{guide.name}</span>
              <span className="text-xs text-ink-soft">Guia de internet</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Planos em destaque */}
      {featuredPlans.length > 0 && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display mb-7 text-3xl font-extrabold text-ink">
              Planos em destaque
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display mb-12 text-center text-3xl font-extrabold text-ink">
          Três passos e você está online
        </h2>
        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Linha que costura os três passos, só no desktop. */}
          <div
            className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-0.5 opacity-25 md:block"
            style={{ background: "var(--brand-gradient)" }}
          />
          {[
            { step: "1", title: "Escolha seu plano", desc: "Selecione o destino e a quantidade de dados ideal para sua viagem." },
            { step: "2", title: "Pague no Pix", desc: "Checkout rápido e seguro. Confirmação em segundos." },
            { step: "3", title: "Escaneie o QR", desc: "Receba o eSIM por e-mail e instale no celular antes de embarcar." },
          ].map((item) => (
            <div key={item.step} className="relative text-center">
              <div
                className="font-display mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-[0_10px_28px_rgba(199,75,158,0.28)]"
                style={{ background: "var(--brand-gradient)" }}
              >
                {item.step}
              </div>
              <h3 className="font-display mt-5 text-xl font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/como-funciona"
            className="font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            Ver o passo a passo completo →
          </Link>
        </div>
      </section>

      {/* Prova social */}
      <ReviewsCarousel reviews={approvedReviews} />

      <section className="relative overflow-hidden bg-deep px-4 py-20 text-white">
        <div
          className="animate-drift pointer-events-none absolute left-1/2 top-1/2 h-72 w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[110px]"
          style={{ background: "var(--brand-gradient)" }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">
            Economize até <span className="text-gradient">90%</span> contra o roaming
          </h2>
          <p className="mt-5 text-lg text-white/60">
            Instale antes de embarcar e chegue no destino com internet funcionando — sem
            fila de loja, sem trocar o chip físico, sem susto na fatura.
          </p>
          <Link
            href="/planos"
            className="mt-8 inline-block rounded-xl bg-[image:var(--brand-gradient)] px-8 py-4 font-bold text-white shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
          >
            Escolher meu plano
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FaqSection items={homeFaq} />
      </section>
    </PublicLayout>
  );
}
