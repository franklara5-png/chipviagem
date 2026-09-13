import { PublicLayout } from "@/components/layout/public-layout";
import { FaqSection, faqJsonLd } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import { getSeoMetadata } from "@/lib/seo";

export const metadata = getSeoMetadata({
  title: "eSIM Brasil: Chip Virtual para Estrangeiros",
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
      "O valor depende da franquia, da validade e do câmbio, e os preços atuais ficam na página de planos. Para estadias de uma semana ou mais, um eSIM costuma sair mais em conta do que o roaming de uma operadora estrangeira no Brasil.",
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

      <PageHero
        title="eSIM Brasil: chip virtual para viajar ao Brasil"
        subtitle="Internet rápida para turistas. Cobertura nacional, ativação em minutos e pagamento internacional."
        badges={["Cobertura nacional", "4G/LTE", "Ativação em minutos"]}
        cta={{ href: "/planos", label: "Ver planos para o Brasil" }}
      />

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display mb-10 text-center text-2xl font-extrabold text-ink md:text-3xl">
          Por que escolher o eSIM Brasil da ChipViagem?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border border-ink/8 bg-surface-raised p-6 transition hover:border-primary hover:shadow-md"
            >
              <span className="text-3xl">{b.icon}</span>
              <h3 className="mt-3 text-lg font-semibold text-ink">{b.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dicas para turistas */}
      <section className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-center text-2xl font-extrabold text-ink md:text-3xl">
            Dicas de internet para turistas no Brasil
          </h2>
          <p className="mt-4 text-center text-ink-soft">
            Veja como usar seu eSIM nas principais cidades brasileiras
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {touristTips.map((t) => (
              <div
                key={t.city}
                className="rounded-xl border border-ink/8 bg-surface-raised p-6"
              >
                <h3 className="font-semibold text-ink">{t.city}</h3>
                <p className="mt-2 text-sm text-ink-soft">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como ativar */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
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
              <p className="mt-2 text-sm text-ink-soft">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="Chegue ao Brasil conectado"
        subtitle="Garanta seu eSIM antes de embarcar. Internet rápida, cobertura nacional e suporte em português, inglês ou espanhol."
        href="/planos"
        label="Comprar eSIM Brasil"
      />

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FaqSection items={faqItems} title="Perguntas frequentes sobre eSIM Brasil" />
      </section>
    </PublicLayout>
  );
}
