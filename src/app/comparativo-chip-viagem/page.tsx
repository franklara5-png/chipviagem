import { PublicLayout } from "@/components/layout/public-layout";
import { FaqSection, faqJsonLd } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import { getSeoMetadata } from "@/lib/seo";

// Comparacao entre CATEGORIAS (eSIM, roaming, chip local), nao entre produtos.
// Sem preco, cobertura ou operadora de plano ChipViagem: o catalogo ainda nao
// existe e esses dados dependem do provedor de eSIM. A versao anterior
// afirmava "a partir de R$ 35", "R$ 8,90/GB", "100+ paises" e "5G em planos
// selecionados" (corrigido em 13/09/2026).
export const metadata = getSeoMetadata({
  title: "Comparativo de Chip de Viagem: Qual o Melhor?",
  description:
    "eSIM, roaming da operadora ou chip local: como cada um cobra, cobertura, ativação e em que tipo de viagem cada um compensa. Guia 2026.",
  path: "/comparativo-chip-viagem",
});

const faqItems = [
  {
    question: "Qual o melhor chip de viagem em 2026?",
    answer:
      "Depende do roteiro. Para um bloco de países, como Europa ou América do Sul, um plano regional costuma ter o melhor custo por GB. Para vários continentes, o plano global faz sentido. Antes do preço, confira se a cobertura inclui todos os países onde o celular pode se conectar, incluindo escalas e bate-voltas.",
  },
  {
    question: "eSIM é melhor que chip físico para viagem?",
    answer:
      "Para a maioria das viagens, sim: o eSIM não exige troca de chip, chega por e-mail e mantém seu número brasileiro ativo. Você instala antes de embarcar e ativa ao chegar. O chip físico ainda é a saída para aparelho sem eSIM, e o chip local comprado no destino costuma exigir cadastro com passaporte.",
  },
  {
    question: "Qual o chip de viagem mais barato?",
    answer:
      "Não existe um mais barato em qualquer caso: o preço muda com a cobertura, a franquia, a validade e o câmbio. Compare o preço por GB, e não o valor final, e desconfie de plano barato que não cobre todos os países do roteiro. Os valores atuais estão na página de planos.",
  },
  {
    question: "O que comparar ao escolher um chip de viagem?",
    answer:
      "Compare, nesta ordem: (1) a lista de países cobertos, pelo nome; (2) a franquia em alta velocidade e o que acontece depois dela; (3) a validade e quando ela começa a contar; (4) se a rede no destino é 4G ou 5G; (5) se o suporte é em português; e (6) o preço por GB.",
  },
  {
    question: "Todos os eSIMs oferecem a mesma velocidade?",
    answer:
      "Não. A velocidade depende da operadora parceira no destino e da tecnologia disponível ali. Antes de comprar, confira no plano quais redes ele usa em cada país e se inclui 5G. Plano vendido como ilimitado costuma reduzir a velocidade depois de um volume diário.",
  },
];

const comparisons = [
  {
    label: "eSIM de viagem",
    payment: "Valor fechado pela franquia",
    activation: "QR code, antes de embarcar",
    coverage: "Um país, uma região ou global",
    support: "Português",
    dualSim: true,
    highlight: true,
  },
  {
    label: "Roaming da operadora",
    payment: "Pacote diário ou por consumo",
    activation: "Automática",
    coverage: "Onde a operadora tem acordo",
    support: "Português",
    dualSim: true,
    highlight: false,
  },
  {
    label: "Chip físico local",
    payment: "Recarga no destino",
    activation: "Loja física, com cadastro",
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

      <PageHero
        title="Comparativo de chip de viagem: qual o melhor?"
        subtitle="eSIM, roaming da operadora ou chip local: como cada um cobra, o que cobre e em que tipo de viagem cada um compensa."
        badges={["eSIM, roaming e chip local", "Sem trocar seu número", "Guia 2026"]}
        cta={{ href: "/planos", label: "Ver planos" }}
      />

      {/* Tabela comparativa */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display mb-8 text-center text-2xl font-extrabold text-ink md:text-3xl">
          eSIM vs. Roaming vs. Chip Local
        </h2>
        <div className="overflow-x-auto rounded-xl border border-ink/8 bg-surface-raised">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/8 bg-surface">
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
              <tr className="border-b border-ink/6">
                <td className="px-6 py-3 font-medium text-ink">Como você paga</td>
                {comparisons.map((c) => (
                  <td key={c.label} className={`px-6 py-3 ${c.highlight ? "bg-primary/5 font-semibold text-primary" : "text-ink-soft"}`}>
                    {c.payment}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-ink/6">
                <td className="px-6 py-3 font-medium text-ink">Ativação</td>
                {comparisons.map((c) => (
                  <td key={c.label} className={`px-6 py-3 ${c.highlight ? "bg-primary/5" : "text-ink-soft"}`}>
                    {c.activation}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-ink/6">
                <td className="px-6 py-3 font-medium text-ink">Cobertura</td>
                {comparisons.map((c) => (
                  <td key={c.label} className={`px-6 py-3 ${c.highlight ? "bg-primary/5" : "text-ink-soft"}`}>
                    {c.coverage}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-ink/6">
                <td className="px-6 py-3 font-medium text-ink">Suporte</td>
                {comparisons.map((c) => (
                  <td key={c.label} className={`px-6 py-3 ${c.highlight ? "bg-primary/5" : "text-ink-soft"}`}>
                    {c.support}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium text-ink">Mantém número BR</td>
                {comparisons.map((c) => (
                  <td key={c.label} className={`px-6 py-3 ${c.highlight ? "bg-primary/5" : "text-ink-soft"}`}>
                    {c.dualSim ? "✅ Sim" : "❌ Não"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Vantagens do eSIM */}
      <section className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-center text-2xl font-extrabold text-ink md:text-3xl">
            Por que o eSIM costuma ser a melhor escolha?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "💰 Conta previsível",
                desc: "Valor fechado pela franquia, sem pacote diário de roaming se acumulando a cada dia de viagem.",
              },
              {
                title: "⚡ Sem fila nem loja",
                desc: "O QR code chega por e-mail. Você instala em casa, antes de embarcar, e desembarca conectado.",
              },
              {
                title: "🌍 Cobertura pelo roteiro",
                desc: "Um único eSIM pode cobrir um país, uma região ou vários continentes, com troca automática de operadora na fronteira.",
              },
              {
                title: "🔒 Seu número continua ativo",
                desc: "O chip brasileiro fica no aparelho para receber SMS do banco. O eSIM é um perfil separado.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-ink/8 bg-surface-raised p-6"
              >
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Encontre o plano ideal para sua viagem"
        subtitle="Escolha a cobertura e a franquia do seu roteiro e instale o eSIM antes de embarcar."
        href="/planos"
        label="Ver todos os planos"
      />

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FaqSection items={faqItems} title="Perguntas frequentes sobre comparativo de chips" />
      </section>
    </PublicLayout>
  );
}
