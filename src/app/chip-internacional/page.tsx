import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { FaqSection, faqJsonLd } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { getSeoMetadata } from "@/lib/seo";

export const metadata = getSeoMetadata({
  title: "Chip Internacional | eSIM para Qualquer País",
  description:
    "Chip internacional (eSIM) com cobertura em 100+ países. Internet rápida, entrega imediata e pagamento via Pix. Viaje conectado com a ChipViagem.",
  path: "/chip-internacional",
});

const faqItems = [
  {
    question: "O que é um chip internacional?",
    answer:
      "É um eSIM (chip virtual) que oferece internet em múltiplos países do mundo. Diferente dos planos regionais, o chip internacional cobre mais de 100 países simultaneamente, sendo ideal para quem visita vários continentes em uma mesma viagem.",
  },
  {
    question: "O chip internacional funciona em qualquer país?",
    answer:
      "Cobre mais de 100 países na Europa, Américas, Ásia, Oceania e África. Verifique a lista completa de países cobertos na página do plano antes de comprar. A cobertura é extensa mas não universal — alguns países e territórios podem não estar incluídos.",
  },
  {
    question: "Qual a diferença entre chip internacional e chip regional?",
    answer:
      "O chip regional cobre uma área geográfica específica (ex: Europa, América do Sul) e costuma ser mais barato. O chip internacional cobre múltiplos continentes e é ideal para mochilões, viagens de negócios com múltiplas escalas ou cruzeiros transatlânticos.",
  },
  {
    question: "Como ativar o chip internacional?",
    answer:
      "Após a compra, você recebe um QR code por e-mail. Escaneie com seu celular, configure o eSIM como chip de dados e ative o roaming ao chegar no primeiro destino. A instalação leva menos de 5 minutos.",
  },
  {
    question: "Posso usar o mesmo eSIM em vários países na mesma viagem?",
    answer:
      "Sim! Essa é a principal vantagem do chip internacional. Você compra uma única vez e usa em todos os países cobertos pelo plano, sem precisar trocar de chip a cada fronteira. A troca de operadora local é automática conforme você se desloca.",
  },
];

const benefits = [
  {
    icon: "🌍",
    title: "100+ países cobertos",
    desc: "Um único eSIM para todos os continentes. Ideal para mochilões e viagens com múltiplas escalas.",
  },
  {
    icon: "⚡",
    title: "Entrega imediata",
    desc: "Pague via Pix e receba o QR code no seu e-mail em minutos. Instale antes de embarcar.",
  },
  {
    icon: "💬",
    title: "Suporte em português",
    desc: "Atendimento humanizado em português para ajudar na instalação e tirar dúvidas durante a viagem.",
  },
  {
    icon: "📱",
    title: "Mantenha seu número",
    desc: "O eSIM funciona como segundo chip. Seu número brasileiro continua ativo para WhatsApp e SMS.",
  },
];

export default function ChipInternacionalPage() {
  return (
    <PublicLayout>
      <JsonLd data={faqJsonLd(faqItems)} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold md:text-5xl">
            Chip Internacional: eSIM para Qualquer País
          </h1>
          <p className="mt-4 text-lg text-sky-100 md:text-xl">
            Um único eSIM para mais de 100 países. Cobertura global, internet rápida e ativação em minutos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full bg-white/20 px-4 py-2">✓ 100+ países</span>
            <span className="rounded-full bg-white/20 px-4 py-2">✓ 4G/LTE</span>
            <span className="rounded-full bg-white/20 px-4 py-2">✓ Entrega imediata</span>
          </div>
          <Link
            href="/planos"
            className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
          >
            Ver planos internacionais
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-ink md:text-3xl">
          Por que escolher o chip internacional da ChipViagem?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-primary hover:shadow-md"
            >
              <span className="text-3xl">{b.icon}</span>
              <h3 className="mt-3 text-lg font-semibold text-ink">{b.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">
            Como usar seu chip internacional
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Escolha o plano",
                desc: "Selecione a franquia (3GB a 10GB) e a duração (7 a 30 dias) ideal para seu roteiro.",
              },
              {
                step: "2",
                title: "Pague no Pix",
                desc: "Checkout seguro e instantâneo. A confirmação leva segundos e o eSIM é liberado na hora.",
              },
              {
                step: "3",
                title: "Conecte-se",
                desc: "Escaneie o QR code, instale o eSIM e ative ao chegar no primeiro destino. Pronto!",
              },
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
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary px-4 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Pronto para viajar conectado?
          </h2>
          <p className="mt-4 text-lg text-sky-100">
            Escolha o plano internacional ideal para sua viagem. Pague no Pix e receba seu eSIM em minutos.
          </p>
          <Link
            href="/planos"
            className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
          >
            Ver planos
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FaqSection items={faqItems} title="Perguntas frequentes sobre chip internacional" />
      </section>
    </PublicLayout>
  );
}
