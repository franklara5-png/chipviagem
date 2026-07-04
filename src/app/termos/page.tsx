import { PublicLayout } from "@/components/layout/public-layout";
import { getSeoMetadata } from "@/lib/seo";

export const metadata = getSeoMetadata({
  title: "Termos de uso",
  path: "/termos",
  noIndex: true,
});

export default function TermosPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
        <h1>Termos de Uso</h1>
        <p><strong>Última atualização:</strong> julho de 2026</p>

        <h2>1. Identificação</h2>
        <p>
          O site chipviagem.com.br é operado pela <strong>Altivia</strong>, CNPJ 63.101.423/0001-18,
          doravante denominada &quot;ChipViagem&quot;.
        </p>

        <h2>2. Serviço</h2>
        <p>
          A ChipViagem comercializa planos de dados móveis via eSIM (chip virtual) para uso em viagens internacionais.
          A entrega é digital e imediata após confirmação do pagamento.
        </p>

        <h2>3. Pagamento</h2>
        <p>
          Aceitamos pagamento via Pix e cartão de crédito, processados pelo Asaas. O pedido só é provisionado
          após confirmação do pagamento.
        </p>

        <h2>4. Política de reembolso</h2>
        <p>
          eSIMs não instalados podem ser reembolsados em até 7 dias após a compra. Após a instalação ou ativação,
          não é possível reembolso por se tratar de produto digital consumido.
        </p>

        <h2>5. Responsabilidades</h2>
        <p>
          O cliente é responsável por verificar a compatibilidade do aparelho com eSIM antes da compra.
          A ChipViagem não se responsabiliza por bloqueios de aparelho ou restrições da operadora local.
        </p>

        <h2>6. Contato</h2>
        <p>suporte@chipviagem.com.br</p>
      </div>
    </PublicLayout>
  );
}
