import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { FaqSection, faqJsonLd } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { getSeoMetadata } from "@/lib/seo";

export const metadata = getSeoMetadata({
  title: "eSIM Brasil | Chip Virtual para Viajar ao Brasil",
  description:
    "eSIM para o Brasil: internet rápida para turistas. Cobertura nacional, ativação em minutos e suporte multilíngue. Compre online e chegue conectado.",
  path: "/esim-brasil",
});

const faqItems = [
  {
    question: "O que é um eSIM para o Brasil?",
    answer:
      "É um chip virtual que turistas estrangeiros podem usar para ter internet durante a estadia no Brasil. Com cobertura nas principais operadoras (Vivo, Claro, TIM), o eSIM oferece dados móveis sem precisar comprar um chip físico em loja.",
  },
  {
    question: "O eSIM funciona em qualquer lugar do Brasil?",
    answer:
      "Sim, a cobertura é nacional. Nas grandes cidades (São Paulo, Rio, Brasília, Salvador, Recife etc.), o sinal 4G é estável e rápido. Em áreas rurais e regiões remotas da Amazônia, a cobertura pode cair para 3G ou ficar indisponível — comum a qualquer operadora.",
  },
  {
    question: "Turistas estrangeiros podem comprar o eSIM Brasil?",
    answer:
      "Sim! O eSIM Brasil da ChipViagem é voltado para turistas que visitam o país. A compra é feita online (pagamento com cartão internacional ou Pix com conta brasileira) e o QR code é enviado por e-mail, sem necessidade de CPF ou cadastro presencial.",
  },
  {
    question: "Quanto custa um eSIM para o Brasil?",
    answer:
      "Os planos começam em R$ 35 para 3GB/7 dias. Planos maiores (5GB/15 dias ou 10GB/30 dias) custam entre R$ 55 e R$ 99. Muito mais barato do que o roaming internacional de operadoras estrangeiras no Brasil.",
  },
  {
    question: "Como funciona a ativação no Brasil?",
    answer:
      "Após a compra, você recebe um QR code. Escaneie com seu celular, configure o eSIM como chip de dados e ative o roaming ao chegar ao Brasil. A instalação leva poucos minutos e não interfere no seu chip principal.",
  },
];

const benefits = [
  {
    icon: "🇧🇷",
    title: "Cobertura nacional",
    desc: "Internet 4G/LTE em todo o Brasil, conectando-se às maiores operadoras: Vivo, Claro e TIM.",
  },
  {
    icon: "💳",
    title: "Pagamento internacional",
    desc: "Aceitamos cartões de crédito internacionais e Pix. Compre antes mesmo de pisar no Brasil.",
  },
  {
    icon: "📲",
    title: "Ativação instantânea",
    desc: "Receba o QR code por e-mail em minutos. Instale antes de embarcar e ative ao aterrissar.",
  },
  {
    icon: "🗣️",
    title: "Suporte multilíngue",
    desc: "Atendimento em português, inglês e espanhol. Estamos prontos para ajudar turistas de qualquer país.",
  },
];

const touristTips = [
  {
    city: "Rio de Janeiro",
    tip: "Use o eSIM para pedir Uber do Aeroporto do Galeão para Copacabana. Evite os táxis não regulamentados e acompanhe a rota no mapa em tempo real.",
  },
  {
    city: "São Paulo",
    tip: "A Avenida Paulista e o centro têm ótimo sinal 4G. Use o Google Maps para navegar pelo metrô — a rede subterrânea paulistana é extensa e eficiente.",
  },
  {
    city: "Salvador",
    tip: "No Pelourinho e no Mercado Modelo, o sinal pode oscilar. Baixe o mapa offline antes de sair do hotel. O eSIM funciona bem na orla e nos principais pontos turísticos.",
  },
  {
    city: "Foz do Iguaçu",
    tip: "A cobertura nas Cataratas é boa. Use a internet para comprar ingressos online e evitar filas na bilheteria do parque.",
  },
];

export default function EsimBrasilPage() {
  return (
    <PublicLayout>
      <JsonLd data={faqJsonLd(faqItems)} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold md:text-5xl">
            eSIM Brasil: Chip Virtual para Viajar ao Brasil
          </h1>
          <p className="mt-4 text-lg text-sky-100 md:text-xl">
            Internet rápida para turistas. Cobertura nacional, ativação em minutos e pagamento internacional.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full bg-white/20 px-4 py-2">✓ Cobertura nacional</span>
            <span className="rounded-full bg-white/20 px-4 py-2">✓ 4G/LTE</span>
            <span className="rounded-full bg-white/20 px-4 py-2">✓ Ativação em minutos</span>
          </div>
          <Link
            href="/planos"
            className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
          >
            Ver planos para o Brasil
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-ink md:text-3xl">
          Por que escolher o eSIM Brasil da ChipViagem?
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

      {/* Dicas para turistas */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-ink md:text-3xl">
            Dicas de internet para turistas no Brasil
          </h2>
          <p className="mt-4 text-center text-slate-600">
            Veja como usar seu eSIM nas principais cidades brasileiras
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {touristTips.map((t) => (
              <div
                key={t.city}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <h3 className="font-semibold text-ink">{t.city}</h3>
                <p className="mt-2 text-sm text-slate-600">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como ativar */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-ink md:text-3xl">
          Como ativar seu eSIM em 3 passos
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Compre online",
              desc: "Escolha o plano, pague com cartão ou Pix e receba o QR code por e-mail.",
            },
            {
              step: "2",
              title: "Escaneie o código",
              desc: "Abra a câmera do celular, escaneie o QR code e instale o perfil eSIM.",
            },
            {
              step: "3",
              title: "Conecte-se no Brasil",
              desc: "Ative o roaming de dados ao aterrissar. Seu celular se conecta automaticamente.",
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
      </section>

      {/* CTA */}
      <section className="bg-primary px-4 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Chegue ao Brasil conectado
          </h2>
          <p className="mt-4 text-lg text-sky-100">
            Garanta seu eSIM antes de embarcar. Internet rápida, cobertura nacional e suporte em português, inglês ou espanhol.
          </p>
          <Link
            href="/planos"
            className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
          >
            Comprar eSIM Brasil
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FaqSection items={faqItems} title="Perguntas frequentes sobre eSIM Brasil" />
      </section>
    </PublicLayout>
  );
}
