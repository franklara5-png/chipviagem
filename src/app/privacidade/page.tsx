import { PublicLayout } from "@/components/layout/public-layout";
import { getSeoMetadata } from "@/lib/seo";

export const metadata = getSeoMetadata({
  title: "Política de privacidade",
  path: "/privacidade",
  noIndex: true,
});

export default function PrivacidadePage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
        <h1>Política de Privacidade</h1>
        <p><strong>Última atualização:</strong> julho de 2026</p>

        <h2>1. Controlador</h2>
        <p>
          Altivia, CNPJ 63.101.423/0001-18, operadora do site chipviagem.com.br (&quot;ChipViagem&quot;),
          é responsável pelo tratamento dos dados pessoais coletados neste site.
        </p>

        <h2>2. Dados coletados</h2>
        <ul>
          <li>Nome, e-mail e CPF — para processamento do pedido e emissão de cobrança</li>
          <li>Dados de pagamento — processados pelo Asaas, sem armazenamento de cartão em nossos servidores</li>
          <li>Dados de navegação — cookies e analytics para melhorar a experiência</li>
        </ul>

        <h2>3. Finalidade</h2>
        <p>
          Utilizamos seus dados para processar pedidos, entregar eSIMs, enviar comunicações sobre o pedido
          e cumprir obrigações legais.
        </p>

        <h2>4. Compartilhamento</h2>
        <p>
          Compartilhamos dados apenas com processadores de pagamento (Asaas), provedores de e-mail (Resend)
          e fornecedores de eSIM necessários para a entrega do produto.
        </p>

        <h2>5. Seus direitos (LGPD)</h2>
        <p>
          Você pode solicitar acesso, correção ou exclusão dos seus dados entrando em contato em
          suporte@chipviagem.com.br.
        </p>

        <h2>6. Segurança</h2>
        <p>
          Utilizamos conexões HTTPS, cookies httpOnly para sessões administrativas e boas práticas de segurança
          para proteger seus dados.
        </p>
      </div>
    </PublicLayout>
  );
}
