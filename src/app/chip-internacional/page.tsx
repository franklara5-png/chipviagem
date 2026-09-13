import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { FaqSection, faqJsonLd } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import { getSeoMetadata } from "@/lib/seo";

// Pagina central do tema "chip internacional": e a URL que o Google associa
// ao maior grupo de consultas do site (Search Console, 12/09/2026). Ela
// responde a duvida e distribui para os posts especificos, que linkam de volta.
// Sem numero de cobertura ou especificacao de plano: o catalogo ainda nao
// existe e esses numeros dependem do provedor de eSIM.
export const metadata = getSeoMetadata({
  title: "Chip Internacional e eSIM: Como Escolher",
  description:
    "O que é chip internacional, a diferença entre eSIM e chip físico, plano regional ou global e como escolher sem pagar por cobertura que você não vai usar.",
  path: "/chip-internacional",
});

const faqItems = [
  {
    question: "O que é um chip internacional?",
    answer:
      "É um plano de internet para usar no exterior sem o roaming da sua operadora, em eSIM (chip virtual) ou em chip físico. Ele se conecta às operadoras locais de cada país da cobertura, e o seu chip brasileiro continua no aparelho para WhatsApp e SMS.",
  },
  {
    question: "O chip internacional funciona em qualquer país?",
    answer:
      "Depende do plano. Planos regionais cobrem um bloco de países, como Europa ou América do Sul; planos globais cobrem vários continentes, mas nenhum cobre todos os territórios. Confira a lista de países pelo nome antes de comprar, incluindo escalas e bate-voltas.",
  },
  {
    question: "Qual a diferença entre chip internacional regional e global?",
    answer:
      "O regional cobre uma área geográfica e costuma sair mais barato por GB. O global cobre vários continentes e só compensa quando o roteiro atravessa continentes ou tem muitas escalas com saída do aeroporto.",
  },
  {
    question: "Meu celular é compatível com eSIM?",
    answer:
      "A maioria dos iPhones a partir do XS e dos Android topo de linha recentes aceita eSIM. O aparelho também precisa estar desbloqueado para outras operadoras. Confira nas configurações de rede do celular se existe a opção de adicionar eSIM.",
  },
  {
    question: "Como ativar o chip internacional?",
    answer:
      "No eSIM, você recebe um QR code por e-mail, escaneia pelo celular, define o eSIM como linha de dados e ativa o roaming de dados dele ao chegar. Faça a instalação ainda no Brasil, com Wi-Fi.",
  },
  {
    question: "Posso usar o mesmo eSIM em vários países na mesma viagem?",
    answer:
      "Sim, desde que todos os países estejam na cobertura do plano. A troca de operadora local acontece sozinha quando você cruza a fronteira. Se um dos países ficar fora da lista, o plano para de funcionar ali.",
  },
];

const benefits = [
  {
    icon: "🌍",
    title: "Cobertura pelo roteiro",
    desc: "Plano de um país, de uma região ou de vários continentes: você escolhe pelo trajeto, não pelo rótulo.",
  },
  {
    icon: "⚡",
    title: "Instala antes de embarcar",
    desc: "eSIM chega por QR code no e-mail. Você instala em casa e desembarca já conectado.",
  },
  {
    icon: "💬",
    title: "Suporte em português",
    desc: "Ajuda na instalação e nas dúvidas durante a viagem, em português.",
  },
  {
    icon: "📱",
    title: "Mantenha seu número",
    desc: "O eSIM funciona como segundo chip. Seu número brasileiro continua ativo para WhatsApp e SMS.",
  },
];

const destinationGuides = [
  { slug: "chip-viagem-argentina", name: "Argentina" },
  { slug: "chip-viagem-estados-unidos", name: "Estados Unidos" },
  { slug: "chip-viagem-portugal", name: "Portugal" },
  { slug: "chip-de-viagem-europa-guia", name: "Europa" },
  { slug: "chip-viagem-chile", name: "Chile" },
  { slug: "chip-viagem-italia", name: "Itália" },
  { slug: "internet-no-japao", name: "Japão" },
  { slug: "chip-viagem-dubai", name: "Dubai" },
];

export default function ChipInternacionalPage() {
  return (
    <PublicLayout>
      <JsonLd data={faqJsonLd(faqItems)} />

      <PageHero
        title="Chip internacional: como funciona e como escolher"
        subtitle="O guia para ter internet no exterior sem pagar roaming: eSIM ou chip físico, plano regional ou global, e o que conferir antes de comprar."
        badges={["eSIM ou chip físico", "Regional ou global", "Sem trocar seu número"]}
        cta={{ href: "/planos", label: "Ver planos" }}
      />

      <div className="prose prose-slate mx-auto max-w-3xl px-4 py-16">
        <h2>O que é um chip internacional</h2>
        <p>
          É um plano de internet para usar fora do Brasil sem depender do roaming da sua
          operadora. Ele se conecta às redes locais dos países cobertos, e você paga um valor
          fechado pela franquia, em vez de pacotes diários que se acumulam.
        </p>
        <p>
          Existem dois formatos: o <strong>eSIM</strong>, que é um chip virtual instalado por QR
          code, e o <strong>chip físico</strong>, o cartãozinho tradicional. Nos dois casos, a
          escolha que mais importa não é o formato — é a cobertura. Se quiser entender a parte
          técnica, veja <Link href="/blog/como-funciona-esim">como funciona o eSIM</Link>.
        </p>

        <h2>eSIM ou chip físico</h2>
        <p>
          O eSIM não tem entrega nem troca de chip: você instala em casa e mantém o chip
          brasileiro no aparelho ao mesmo tempo. Em compensação, exige celular compatível e
          desbloqueado. O chip físico serve para aparelho sem eSIM, mas depende de envio ou de
          compra no destino, e ocupa o lugar do seu chip nos celulares com uma entrada só.
        </p>
        <p>
          A comparação completa, com prós e contras de cada um, está em{" "}
          <Link href="/blog/esim-ou-chip-fisico-diferencas">eSIM ou chip físico: diferenças</Link>.
        </p>

        <h2>Regional ou global: a escolha que mais pesa</h2>
        <p>
          O erro mais caro não é escolher o fornecedor errado, é escolher a cobertura errada. A
          regra prática é contar fronteiras, e não países: bate-volta de Buenos Aires a Colonia,
          ferry da Espanha para Marrocos e um dia em Londres saindo de Paris derrubam um plano de
          país único.
        </p>
        <ul>
          <li>
            <strong>União Europeia</strong> tem roaming interno: um plano regional europeu vale nos
            países membros. Reino Unido e Suíça ficam de fora por padrão.
          </li>
          <li>
            <strong>América do Sul</strong> não tem nada equivalente: um plano só da Argentina não
            funciona no Chile nem no Uruguai.
          </li>
          <li>
            <strong>Plano global</strong> só compensa quando o roteiro atravessa continentes.
          </li>
        </ul>
        <p>
          O passo a passo dessa decisão está em{" "}
          <Link href="/blog/melhor-chip-viagem-internacional">plano regional ou global</Link>.
        </p>

        <h2>Chip internacional ou roaming da operadora</h2>
        <p>
          O roaming é a alternativa de não fazer nada, e costuma ser a mais cara em viagem de uma
          semana ou mais, porque o pacote diário se acumula e a franquia é pequena. Em viagem de um
          ou dois dias a diferença pode ser menor, e vale fazer a conta. Veja{" "}
          <Link href="/blog/chip-de-viagem-ou-roaming">chip de viagem ou roaming</Link> e{" "}
          <Link href="/blog/quanto-custa-roaming-internacional">
            quanto custa o roaming internacional
          </Link>
          .
        </p>

        <h2>Quanto custa e quantos GB levar</h2>
        <p>
          O preço sai de quatro fatores: a abrangência da cobertura, a franquia, a validade e o
          câmbio. Por isso desconfie de quem dá um número sem perguntar o destino e o tempo de
          viagem. Os fatores estão explicados em{" "}
          <Link href="/blog/quanto-custa-chip-viagem">quanto custa um chip de viagem</Link>, e a
          franquia certa você estima na <Link href="/quantos-gb-preciso">calculadora de GB</Link>.
        </p>

        <h2>Checklist antes de comprar</h2>
        <ul>
          <li>O celular aceita eSIM e está desbloqueado para outras operadoras.</li>
          <li>
            A lista de países do plano cita pelo nome todos os lugares onde o celular pode se
            conectar, incluindo escalas com saída do aeroporto e bate-voltas.
          </li>
          <li>A franquia foi estimada pelo seu uso real, e não pelo pacote mais barato.</li>
          <li>Você sabe quando a validade começa a contar: na compra ou na primeira conexão.</li>
          <li>
            O chip brasileiro fica ativo para SMS de banco, com roaming de dados desligado. Veja{" "}
            <Link href="/blog/whatsapp-numero-brasileiro-viagem">
              como manter o WhatsApp no número brasileiro
            </Link>
            .
          </li>
          <li>
            A instalação é feita ainda no Brasil, com Wi-Fi. Passo a passo em{" "}
            <Link href="/blog/como-instalar-esim">como instalar o eSIM</Link>, e o plano B em{" "}
            <Link href="/blog/esim-nao-conecta-o-que-fazer">eSIM não conecta</Link>.
          </li>
        </ul>

        <h2>Guias por destino</h2>
        <p>Cada país tem pegadinhas próprias de cobertura, fronteira e costume local:</p>
        <ul>
          {destinationGuides.map((g) => (
            <li key={g.slug}>
              <Link href={`/blog/${g.slug}`}>Chip de viagem para {g.name}</Link>
            </li>
          ))}
        </ul>
        <p>
          Os demais estão no <Link href="/blog">blog</Link>.
        </p>
      </div>

      {/* Como funciona */}
      <section className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
            Como usar seu chip internacional
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Escolha o plano",
                desc: "Defina a cobertura pelo roteiro e a franquia pelo seu uso, com a calculadora de GB.",
              },
              {
                step: "2",
                title: "Pague no Pix",
                desc: "Checkout rápido. A confirmação do pagamento libera o eSIM.",
              },
              {
                step: "3",
                title: "Conecte-se",
                desc: "Escaneie o QR code, instale o eSIM ainda no Brasil e ative ao chegar no primeiro destino.",
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
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display mb-10 text-center text-2xl font-extrabold text-ink md:text-3xl">
          Por que o chip internacional da ChipViagem
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

      <CtaBand
        title="Pronto para viajar conectado?"
        subtitle="Escolha a cobertura e a franquia do seu roteiro. Pague no Pix e instale o eSIM antes de embarcar."
        href="/planos"
        label="Ver planos"
      />

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FaqSection items={faqItems} title="Perguntas frequentes sobre chip internacional" />
      </section>
    </PublicLayout>
  );
}
