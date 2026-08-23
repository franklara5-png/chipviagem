import Link from "next/link";
import { HABITS, SAFETY_MARGIN } from "@/lib/data-usage";

/**
 * Tabela de consumo gerada a partir de HABITS — a mesma fonte que alimenta a
 * calculadora em /quantos-gb-preciso. Nao repetir os numeros aqui a mao:
 * se as premissas mudarem, esta secao acompanha sozinha.
 */
export function PlanGuide() {
  const margem = Math.round(SAFETY_MARGIN * 100);

  return (
    <section className="mt-16 border-t border-slate-200 pt-12">
      <h2 className="text-2xl font-bold text-ink">Como escolher a franquia de dados</h2>
      <p className="mt-3 max-w-2xl text-slate-600">
        A conta é simples: quanto você consome por dia, vezes os dias de viagem. O que costuma
        pesar não é o WhatsApp — é vídeo, rede social e hotspot para o notebook. Estes são os
        valores médios por hora que usamos na calculadora:
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-2 pr-4 font-medium">Atividade</th>
              <th className="pb-2 pr-4 font-medium">Exemplos</th>
              <th className="pb-2 font-medium whitespace-nowrap">Consumo por hora</th>
            </tr>
          </thead>
          <tbody>
            {HABITS.map((h) => (
              <tr key={h.key} className="border-b border-slate-100">
                <td className="py-2.5 pr-4 font-medium text-ink">{h.label}</td>
                <td className="py-2.5 pr-4 text-slate-500">{h.description}</td>
                <td className="py-2.5 whitespace-nowrap text-slate-700">
                  ~{h.mbPerHour[2]} MB
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Valores para uso moderado, com o vídeo em qualidade média. Em cima do total estimado,
        a calculadora ainda soma {margem}% de margem de segurança — rede lenta faz o app
        recarregar, e recarga consome de novo.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/quantos-gb-preciso"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Calcular quantos GB eu preciso
        </Link>
        <Link
          href="/comparativo-chip-viagem"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
        >
          Comparar eSIM, chip físico e roaming
        </Link>
      </div>
    </section>
  );
}

const INCLUSOS = [
  {
    titulo: "Entrega imediata por e-mail",
    texto: "Assim que o pagamento é confirmado, o QR code do eSIM chega no seu e-mail e na página do pedido.",
  },
  {
    titulo: "Pagamento via Pix",
    texto: "Confirmação em segundos, sem precisar de cartão internacional.",
  },
  {
    titulo: "Seu número brasileiro continua ativo",
    texto: "O eSIM fornece só os dados móveis. O WhatsApp segue funcionando normalmente com o seu número.",
  },
  {
    titulo: "Suporte em português",
    texto: "Atendimento em português antes, durante e depois da viagem.",
  },
];

export function PlanIncludes() {
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold text-ink">O que está incluído em todos os planos</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {INCLUSOS.map((i) => (
          <div key={i.titulo} className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-ink">{i.titulo}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{i.texto}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-slate-500">
        Antes de comprar, confira se o seu aparelho é compatível: iPhones a partir do XS e a
        maioria dos Android recentes (Samsung Galaxy S20+, Google Pixel 3+) suportam eSIM.
        O passo a passo completo está em{" "}
        <Link href="/como-funciona" className="text-primary hover:underline">
          como funciona
        </Link>
        .
      </p>
    </section>
  );
}

export const PLANOS_FAQ = [
  {
    question: "Como sei quantos GB comprar?",
    answer:
      "Multiplique seu consumo diário pelos dias de viagem e acrescente uma margem. A calculadora em /quantos-gb-preciso faz essa conta a partir dos seus hábitos (maps, WhatsApp, redes sociais, streaming e hotspot) e já soma 30% de margem de segurança.",
  },
  {
    question: "Um plano serve para mais de um país?",
    answer:
      "Depende do plano. Os planos regionais cobrem vários países da mesma região com o mesmo eSIM — útil para quem faz roteiro por mais de um destino. Os planos de país cobrem apenas aquele país. A cobertura de cada plano aparece no card e na página do plano.",
  },
  {
    question: "Meu celular precisa ser novo ou desbloqueado?",
    answer:
      "Não precisa ser novo, mas precisa ter suporte a eSIM e estar desbloqueado para outras operadoras. iPhones a partir do XS e a maioria dos Android recentes (Samsung Galaxy S20+, Google Pixel 3+) são compatíveis. Confira em Ajustes se aparece a opção de adicionar plano celular via QR code.",
  },
  {
    question: "O eSIM substitui o meu chip brasileiro?",
    answer:
      "Não. O eSIM entra como uma linha adicional e fornece apenas os dados móveis no destino. O seu chip brasileiro continua no aparelho e o seu número segue ativo, então o WhatsApp funciona normalmente.",
  },
];
