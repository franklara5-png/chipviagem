import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEsimEmail(data: {
  to: string;
  customerName: string;
  planName: string;
  qrCodeUrl: string;
  activationCode: string;
  smdpAddress: string;
  orderPublicId: string;
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0EA5E9;">ChipViagem</h1>
      <p>Olá, ${data.customerName}!</p>
      <p>Seu eSIM <strong>${data.planName}</strong> está pronto para instalação.</p>
      <p><strong>Código de ativação:</strong><br/><code>${data.activationCode}</code></p>
      <p><strong>Endereço SM-DP+:</strong> ${data.smdpAddress}</p>
      <p>Escaneie o QR code abaixo ou acesse seu pedido:</p>
      <img src="${data.qrCodeUrl}" alt="QR Code eSIM" width="250" />
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://chipviagem.com.br"}/pedido/${data.orderPublicId}">Ver pedido online</a></p>
      <hr/>
      <p style="color: #666; font-size: 12px;">ChipViagem — Altivia CNPJ 63.101.423/0001-18</p>
    </div>
  `;

  if (!resend) {
    console.log("[DEV] E-mail não enviado (RESEND_API_KEY ausente):", { to: data.to, planName: data.planName });
    return { id: "dev-mock" };
  }

  return resend.emails.send({
    from: "ChipViagem <noreply@chipviagem.com.br>",
    to: data.to,
    subject: `Seu eSIM ${data.planName} está pronto!`,
    html,
  });
}
