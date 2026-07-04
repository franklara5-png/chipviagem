import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ReferralRewardEmailProps {
  referrerName: string;
  rewardCode: string;
  rewardValue: number;
  siteUrl: string;
  supportEmail?: string;
  whatsappUrl?: string;
  whatsappDisplay?: string;
}

export function ReferralRewardEmail({
  referrerName,
  rewardCode,
  rewardValue,
  siteUrl,
  supportEmail,
  whatsappUrl,
  whatsappDisplay,
}: ReferralRewardEmailProps) {
  const firstName = referrerName.split(" ")[0];

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{`Seu amigo comprou! Você ganhou R$ ${rewardValue} de desconto`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>ChipViagem</Heading>
          <Text style={text}>Olá, {firstName}!</Text>
          <Text style={text}>
            Ótima notícia: alguém usou seu link de indicação e concluiu a compra. Como agradecimento,
            você ganhou <strong>R$ {rewardValue.toFixed(2).replace(".", ",")}</strong> de desconto na
            próxima compra.
          </Text>

          <Section style={codeBox}>
            <Text style={codeLabel}>Seu cupom</Text>
            <Text style={codeValue}>{rewardCode}</Text>
          </Section>

          <Section style={{ textAlign: "center" as const, marginTop: 24 }}>
            <Button style={button} href={`${siteUrl}/planos`}>
              Usar meu desconto
            </Button>
          </Section>

          <Text style={small}>
            Válido para pedidos a partir de R$ 39,00. Uso único.
          </Text>

          {(supportEmail || whatsappUrl) && (
            <Section style={supportBox}>
              <Text style={supportTitle}>Dúvidas?</Text>
              {supportEmail && (
                <Text style={text}>
                  E-mail: <Link href={`mailto:${supportEmail}`}>{supportEmail}</Link>
                </Text>
              )}
              {whatsappUrl && whatsappDisplay && (
                <Text style={text}>
                  WhatsApp:{" "}
                  <Link href={whatsappUrl} style={{ color: "#25D366" }}>
                    {whatsappDisplay}
                  </Link>
                </Text>
              )}
            </Section>
          )}

          <Hr style={hr} />
          <Text style={footer}>ChipViagem — Altivia CNPJ 63.101.423/0001-18</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f8fafc", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "24px", maxWidth: "560px" };
const h1 = { color: "#0EA5E9", fontSize: "24px", margin: "0 0 16px" };
const text = { color: "#334155", fontSize: "15px", lineHeight: "1.6" };
const codeBox = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
  marginTop: "16px",
};
const codeLabel = { color: "#64748b", fontSize: "12px", margin: "0 0 4px", textTransform: "uppercase" as const };
const codeValue = { color: "#0f172a", fontSize: "22px", fontWeight: "bold" as const, margin: 0, letterSpacing: "2px" };
const button = {
  backgroundColor: "#f97316",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "8px",
  fontWeight: "600" as const,
  textDecoration: "none",
};
const small = { color: "#94a3b8", fontSize: "12px", marginTop: "16px" };
const hr = { borderColor: "#e2e8f0", margin: "24px 0" };
const footer = { color: "#94a3b8", fontSize: "12px" };
const supportBox = {
  marginTop: "24px",
  padding: "16px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};
const supportTitle = { color: "#334155", fontSize: "14px", fontWeight: "bold" as const, margin: "0 0 8px" };
