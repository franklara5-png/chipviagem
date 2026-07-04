import { Suspense } from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { FaqSection, faqJsonLd } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { GbCalculator } from "./calculator";
import { db } from "@/db";
import { destinations, plans } from "@/db/schema";
import { getPlanFilterForDestination } from "@/lib/destinations/plan-filter";
import { toPlanSummary } from "@/lib/plan-recommendations";
import { HABITS } from "@/lib/data-usage";
import { getSeoMetadata } from "@/lib/seo";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata = getSeoMetadata({
  title: "Quantos GB eu preciso? Calculadora de dados para viagem",
  description:
    "Calcule quantos gigas de internet você precisa na viagem. Ferramenta gratuita com estimativa por hábito e recomendação de planos eSIM.",
  path: "/quantos-gb-preciso",
});

const calculatorFaq = [
  {
    question: "10GB dá pra quanto tempo de viagem?",
    answer:
      "Depende do seu perfil. Para uso moderado (Maps, WhatsApp, redes sociais e um pouco de streaming), 10 GB costumam durar de 10 a 14 dias. Se você assiste muito vídeo em HD ou usa hotspot no notebook, pode acabar em 5–7 dias. Use nossa calculadora acima para uma estimativa personalizada.",
  },
  {
    question: "O que mais consome internet em viagem?",
    answer:
      "Streaming de vídeo em alta qualidade é o maior vilão — Netflix e YouTube em HD consomem cerca de 1 GB por hora. Chamadas de vídeo (Zoom, FaceTime) vêm em segundo, seguidas de redes sociais com vídeo (TikTok, Reels). Maps e WhatsApp com texto/áudio consomem bem menos.",
  },
  {
    question: "Devo comprar mais dados do que a calculadora sugere?",
    answer:
      "Nossa ferramenta já inclui 30% de margem de segurança. Se você pretende usar hotspot para trabalhar, fazer muitas videochamadas ou assistir séries no celular, considere subir um degrau no plano. É mais barato comprar o pacote certo antes da viagem do que ficar sem dados no meio do roteiro.",
  },
  {
    question: "Wi-Fi do hotel substitui o chip de viagem?",
    answer:
      "Wi-Fi ajuda, mas não cobre deslocamentos, passeios, emergências nem momentos fora do hotel. A combinação ideal é eSIM para mobilidade + Wi-Fi para downloads pesados. Muitos viajantes usam o eSIM como rede principal e o Wi-Fi para atualizar apps e baixar mapas offline.",
  },
  {
    question: "A calculadora funciona para qualquer destino?",
    answer:
      "Sim. O consumo de dados depende dos seus hábitos, não do país. Porém, se você acessar com ?destino=japao (ou outro slug), mostramos planos específicos daquele destino. Sem filtro, recomendamos planos do catálogo geral que cobrem a quantidade estimada.",
  },
];

interface PageProps {
  searchParams: Promise<{ destino?: string }>;
}

export default async function QuantosGbPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const destinoSlug = params.destino;

  let destinoName: string | undefined;
  let countryCode: string | undefined;

  if (destinoSlug) {
    const [dest] = await db
      .select()
      .from(destinations)
      .where(eq(destinations.slug, destinoSlug))
      .limit(1);
    if (dest) {
      destinoName = dest.name;
      countryCode = dest.countryCode;
    }
  }

  let activePlans = await db.select().from(plans).where(eq(plans.isActive, true)).catch(() => []);

  if (countryCode) {
    const filter = getPlanFilterForDestination(countryCode);
    if (filter) {
      activePlans = await db.select().from(plans).where(filter).catch(() => activePlans);
    }
  }

  const planSummaries = activePlans.map(toPlanSummary);

  return (
    <PublicLayout>
      <JsonLd data={faqJsonLd(calculatorFaq)} />

      <section className="bg-gradient-to-br from-primary to-primary-dark px-4 py-12 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            Quantos GB eu preciso na viagem?
          </h1>
          <p className="mt-4 text-lg text-sky-100">
            Calcule em segundos e receba recomendações de planos reais do nosso catálogo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <Suspense fallback={<p className="text-center text-slate-500">Carregando calculadora…</p>}>
          <GbCalculator
            plans={planSummaries}
            destinoSlug={destinoSlug}
            destinoName={destinoName}
          />
        </Suspense>
      </section>

      {/* Conteúdo SEO */}
      <article className="mx-auto max-w-3xl px-4 pb-16 prose prose-slate">
        <h2>Como estimar o consumo de dados em viagens internacionais</h2>
        <p>
          Escolher o plano certo de chip de viagem (eSIM) começa por entender quanto você realmente
          usa no dia a dia — só que em viagem os hábitos mudam. Você navega mais no Maps, manda mais
          fotos no WhatsApp, posta stories dos passeios e talvez assista uma série no avião ou no
          hotel. Comprar poucos dados significa ficar offline no meio do roteiro; comprar demais é
          jogar dinheiro fora.
        </p>
        <p>
          A calculadora da ChipViagem traduz seus hábitos em megabytes e gigabytes com premissas
          conservadoras, baseadas em médias reais de consumo por aplicativo. Não é uma promessa
          milimétrica — o consumo varia conforme qualidade de vídeo, sincronização em segundo plano
          e atualizações automáticas — mas é um ponto de partida muito melhor do que chutar
          &quot;3 GB ou 10 GB?&quot; sem critério.
        </p>

        <h2>Tabela de consumo médio por aplicativo</h2>
        <p>
          Os valores abaixo representam consumo aproximado por hora de uso ativo. Na calculadora,
          cada nível de intensidade (leve, moderado, pesado) combina essas taxas com horas médias
          de uso por dia.
        </p>
        <div className="not-prose overflow-x-auto">
          <table className="w-full text-sm border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Aplicativo / uso</th>
                <th className="px-4 py-2 text-left">Consumo aproximado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HABITS.map((h) => (
                <tr key={h.key}>
                  <td className="px-4 py-2 font-medium">{h.label}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {h.key === "streaming"
                      ? "~1.000 MB/h (HD)"
                      : h.key === "video"
                        ? "~300 MB/h"
                        : h.key === "social"
                          ? "~150 MB/h"
                          : h.key === "maps"
                            ? "~5 MB/h"
                            : h.key === "whatsapp"
                              ? "~15 MB/h"
                              : h.key === "music"
                                ? "~50 MB/h"
                                : "~200 MB/h"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Dicas para economizar dados no exterior</h2>
        <h3>Baixe mapas offline antes de embarcar</h3>
        <p>
          No Google Maps, abra o mapa da cidade, toque no perfil → &quot;Mapas offline&quot; →
          &quot;Selecionar seu próprio mapa&quot;. Com o mapa salvo, a navegação consome muito
          menos dados móveis — às vezes quase zero. Faça o mesmo para a região onde vai passar
          mais tempo.
        </p>
        <h3>Ajuste a qualidade do streaming</h3>
        <p>
          Netflix, YouTube e Spotify permitem reduzir a qualidade para economizar. Em viagem,
          prefira 480p ou &quot;economia de dados&quot; no YouTube. A diferença de consumo entre
          HD e SD pode ser de 3x a 5x por hora de vídeo.
        </p>
        <h3>Ative o modo economia de dados</h3>
        <p>
          No iPhone: Ajustes → Celular → Opções de dados → Modo de dados baixos. No Android:
          Configurações → Rede → Economia de dados. Isso limita sincronização em segundo plano e
          downloads automáticos de mídia no WhatsApp e Instagram.
        </p>
        <h3>Use Wi-Fi para backups e atualizações</h3>
        <p>
          Desative &quot;atualizar apps automaticamente&quot; e backups de fotos em dados móveis
          antes de viajar. Faça backup e atualizações apenas em Wi-Fi de hotel ou café. Uma
          sincronização de fotos em 4K pode consumir centenas de MB sem você perceber.
        </p>
        <h3>Desative roaming do chip brasileiro</h3>
        <p>
          Mantenha o chip nacional só para SMS e ligações se necessário, mas desligue dados móveis
          da linha brasileira. O eSIM de viagem deve ser a linha de dados padrão enquanto estiver
          no exterior.
        </p>

        <h2>Quanto GB comprar para viagens comuns?</h2>
        <p>
          <strong>Fim de semana (3–4 dias):</strong> uso leve a moderado → 1 a 3 GB costumam
          bastar. <strong>Viagem de uma semana:</strong> perfil turístico com Maps, WhatsApp e
          redes sociais → 3 a 5 GB. <strong>Duas semanas na Europa ou EUA:</strong> uso moderado
          com algum streaming → 5 a 10 GB. <strong>Trabalho remoto com videochamadas:</strong>
          considere 10 GB ou mais, ou um plano regional com boa validade.
        </p>
        <p>
          Lembre-se: nossa calculadora já adiciona 30% de margem. Se estiver em dúvida entre dois
          planos, prefira o maior — a diferença de preço costuma ser menor do que comprar um
          top-up de emergência no destino.
        </p>

        <h2>Próximo passo: escolher seu chip de viagem</h2>
        <p>
          Depois de calcular, confira os planos recomendados acima ou explore o{" "}
          <Link href="/planos">catálogo completo</Link>. Todos os planos ChipViagem têm entrega
          imediata por e-mail, pagamento via Pix e suporte em português. Leia também nosso guia{" "}
          <Link href="/blog/chip-de-viagem-ou-roaming">chip de viagem vs roaming</Link> e{" "}
          <Link href="/blog/como-instalar-esim">como instalar o eSIM</Link>.
        </p>
      </article>

      <section className="mx-auto max-w-3xl px-4 pb-16">
        <FaqSection items={calculatorFaq} title="Perguntas frequentes" />
      </section>
    </PublicLayout>
  );
}
