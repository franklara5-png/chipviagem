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

interface ReviewRequestEmailProps {
  customerName: string;
  destinationName: string;
  token: string;
  siteUrl: string;
  supportEmail?: string;
  whatsappUrl?: string;
  whatsappDisplay?: string;
}

function starLink(siteUrl: string, token: string, rating: number) {
  return `${siteUrl}/avaliar/${token}?nota=${rating}`;
}

export function ReviewRequestEmail({
  customerName,
  destinationName,
  token,
  siteUrl,
  supportEmail,
  whatsappUrl,
  whatsappDisplay,
}: ReviewRequestEmailProps) {
  const firstName = customerName.split(" ")[0];

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Como foi a internet na sua viagem para {destinationName}?</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>ChipViagem</Heading>
          <Text style={text}>Olá, {firstName}!</Text>
          <Text style={text}>
            Esperamos que sua viagem para <strong>{destinationName}</strong> tenha sido incrível.
            Como foi a qualidade da internet com seu eSIM?
          </Text>
          <Text style={text}>Clique nas estrelas para avaliar (leva menos de 1 minuto):</Text>
          <Section style={stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Link key={n} href={starLink(siteUrl, token, n)} style={starBtn}>
                {"⭐".repeat(n)}
              </Link>
            ))}
          </Section>
          <Button style={button} href={`${siteUrl}/avaliar/${token}`}>
            Deixar minha avaliação
          </Button>
          {(supportEmail || whatsappUrl) && (
            <Section style={supportBox}>
              <Text style={supportTitle}>Precisa de ajuda?</Text>
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
const text = { color: "#0F172A", fontSize: "16px", lineHeight: "24px" };
const stars = { textAlign: "center" as const, margin: "24px 0" };
const starBtn = {
  display: "inline-block",
  margin: "4px",
  padding: "8px 12px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  textDecoration: "none",
  fontSize: "14px",
};
const button = {
  backgroundColor: "#F97316",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "block",
  textAlign: "center" as const,
  fontWeight: "bold",
};
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

export default ReviewRequestEmail;
