import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { FaqSection, faqJsonLd } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { getSeoMetadata } from "@/lib/seo";

export const metadata = getSeoMetadata({
  title: "Comparativo de Chip de Viagem | Qual o Melhor?",
  description:
    "Compare os melhores chips de viagem (eSIM) de 2026: preço, cobertura, velocidade e benefícios. Descubra qual o melhor eSIM para sua próxima viagem.",
  path: "/comparativo-chip-viagem",
});

const faqItems = [
  {
    question: "Qual o melhor chip de viagem em 2026?",
    answer:
      "O melhor chip de viagem depende do seu destino e uso. Para viagens regionais (ex: Europa), planos regionais oferecem o melhor custo-benefício (R$ 39–R$ 55/3GB). Para múltiplos continentes, o plano global é a melhor escolha. A ChipViagem trabalha com os provedores mais confiáveis do mercado para cada região.",
  },
  {
    question: "eSIM é melhor que chip físico para viagem?",
    answer:
      "Sim. O eSIM não exige troca de chip, tem entrega imediata por e-mail e mantém seu número brasileiro ativo. Além disso, você instala antes de embarcar e ativa ao chegar. O chip físico exige compra no destino, muitas vezes com cadastro e passaporte.",
  },
  {
    question: "Qual o chip de viagem mais barato?",
    answer:
      "Planos regionais de 3GB para 7 dias custam a partir de R$ 35 na ChipViagem. O valor por GB fica mais baixo nos planos maiores: um plano de 10GB pode custar R$ 8,90/GB, contra R$ 11,60/GB no plano de 3GB.",
  },
  {
    question: "O que comparar ao escolher um chip de viagem?",
    answer:
      "Compare sempre: (1) cobertura no seu destino específico, (2) franquia de dados em alta velocidade, (3) duração do plano (7, 15 ou 30 dias), (4) se a tecnologia é 4G ou 5G, (5) se o suporte é em português, e (6) o preço por GB efetivo.",
  },
  {
    question: "Todos os eSIMs oferecem a mesma velocidade?",
    answer:
      "Não. A velocidade depende da operadora parceira no destino e da tecnologia disponível (4G vs. 5G). Os planos da ChipViagem utilizam as maiores operadoras locais (T-Mobile, Vodafone, Movistar etc.) e oferecem 4G/LTE de alta velocidade, com 5G disponível em planos selecionados.",
  },
];

const comparisons = [
  {
    label: "eSIM (ChipViagem)",
    price: "R$ 35–R$ 199",
    activation: "Imediata (QR code)",
    coverage: "100+ países",
    support: "Português",
    dualSim: true,
    highlight: true,
  },
  {
    label: "Roaming Internacional",
    price: "R$ 30–R$ 60/dia",
    activation: "Automática",
    coverage: "Quase todos os países",
    support: "Português",
    dualSim: true,
    highlight: false,
  },
  {
    label: "Chip Físico Local",
    price: "US$ 5–US$ 30",
    activation: "Loja física",
    coverage: "Um país",
    support: "Idioma local",
    dualSim: false,
    highlight: false,
  },
];

export default function ComparativoChipViagemPage() {
  return (
    <PublicLayout>
      <JsonLd data={faqJsonLd(faqItems)} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold md:text-5xl">
            Comparativo de Chip de Viagem: Qual o Melhor?
          </h1>
          <p className="mt-4 text-lg text-sky-100 md:text-xl">
            Compare eSIMs, roaming internacional e chips físicos. Descubra a melhor opção para sua viagem.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full bg-white/20 px-4 py-2">✓ Comparação imparcial</span>
            <span className="rounded-full bg-white/20 px-4 py-2">✓ Preços em reais</span>
            <span className="rounded-full bg-white/20 px-4 py-2">✓ Atualizado 2026</span>
          </div>
          <Link
            href="/planos"
            className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
          >
            Ver planos e preços
          </Link>
        </div>
      </section>

      {/* Tabela comparativa */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-ink md:text-3xl">
          eSIM vs. Roaming vs. Chip Local
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 font-semibold text-ink">Critério</th>
                {comparisons.map((c) => (
                  <th
                    key={c.label}
                    className={`px-6 py-4 font-semibold ${c.highlight ? "bg-primary/10 text-primary" : "text-ink"}`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-6 py-3 font-medium text-ink">Preço (médio)</td>
                {comparisons.map((c) => (
                  <td key={c.label} className={`px-6 py-3 ${c.highlight ? "bg-primary/5 font-semibold text-primary" : "text-slate-600"}`}>
                    {c.price}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-6 py-3 font-medium text-ink">Ativação</td>
                {comparisons.map((c) => (
                  <td key={c.label} className={`px-6 py-3 ${c.highlight ? "bg-primary/5" : "text-slate-600"}`}>
                    {c.activation}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-6 py-3 font-medium text-ink">Cobertura</td>
                {comparisons.map((c) => (
                  <td key={c.label} className={`px-6 py-3 ${c.highlight ? "bg-primary/5" : "text-slate-600"}`}>
                    {c.coverage}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-6 py-3 font-medium text-ink">Suporte</td>
                {comparisons.map((c) => (
                  <td key={c.label} className={`px-6 py-3 ${c.highlight ? "bg-primary/5" : "text-slate-600"}`}>
                    {c.support}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium text-ink">Mantém número BR</td>
                {comparisons.map((c) => (
                  <td key={c.label} className={`px-6 py-3 ${c.highlight ? "bg-primary/5" : "text-slate-600"}`}>
                    {c.dualSim ? "✅ Sim" : "❌ Não"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Vantagens do eSIM */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-ink md:text-3xl">
            Por que o eSIM é a melhor escolha?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "💰 Mais barato",
                desc: "Economize até 90% em comparação com o roaming internacional da sua operadora. Planos a partir de R$ 35.",
              },
              {
                title: "⚡ Mais rápido",
                desc: "Ativação em minutos, sem filas, sem loja física. Pague no Pix e receba o QR code imediatamente.",
              },
              {
                title: "🌍 Mais cobertura",
                desc: "Mais de 100 países com um único eSIM. Troca automática de operadora conforme você se desloca.",
              },
              {
                title: "🔒 Mais seguro",
                desc: "Seu número brasileiro permanece ativo para SMS de bancos. O eSIM é um perfil separado e seguro.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
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
            Encontre o plano ideal para sua viagem
          </h2>
          <p className="mt-4 text-lg text-sky-100">
            Compare planos, escolha a franquia e a duração, pague no Pix e viaje conectado. Simples assim.
          </p>
          <Link
            href="/planos"
            className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
          >
            Ver todos os planos
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FaqSection items={faqItems} title="Perguntas frequentes sobre comparativo de chips" />
      </section>
    </PublicLayout>
  );
}
