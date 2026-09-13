import { PublicLayout } from "@/components/layout/public-layout";
import { getSeoMetadata } from "@/lib/seo";

export const metadata = getSeoMetadata({
  title: "Como funciona",
  description: "Saiba como comprar e instalar seu chip de viagem (eSIM) na ChipViagem em 3 passos simples.",
  path: "/como-funciona",
});

export default function ComoFuncionaPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Como funciona</h1>
        <p className="mt-4 text-lg text-ink-soft">
          Comprar e usar um eSIM na ChipViagem é simples. Veja o passo a passo:
        </p>

        <div className="mt-8 space-y-8">
          {[
            {
              title: "1. Escolha seu plano",
              body: "Escolha o destino — um país, uma região ou um plano global — e a franquia de dados. Se estiver em dúvida sobre quantos GB levar, a calculadora de GB estima pelo seu uso.",
            },
            {
              title: "2. Pague com Pix ou cartão",
              body: "No checkout, informe nome, e-mail e CPF. Escolha Pix para pagamento instantâneo ou cartão de crédito. A confirmação do Pix geralmente leva poucos segundos.",
            },
            {
              title: "3. Instale o eSIM",
              body: "Após a confirmação do pagamento, você recebe o QR code por e-mail e na página do pedido. Escaneie com seu celular e ative o plano ao chegar no destino (ou antes de embarcar).",
            },
          ].map((step) => (
            <div key={step.title} className="rounded-xl border border-ink/8 bg-surface-raised p-6">
              <h2 className="text-xl font-semibold text-ink">{step.title}</h2>
              <p className="mt-2 text-ink-soft">{step.body}</p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-ink">Compatibilidade</h2>
          <p className="mt-2 text-ink-soft">
            eSIMs funcionam em iPhones a partir do XS, Samsung Galaxy S20+, Google Pixel 3+ e diversos modelos recentes.
            Verifique em Ajustes/Configurações se seu aparelho permite adicionar plano celular via QR code.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}
