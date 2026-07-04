import { Resend } from "resend";
import { getSetting } from "@/lib/settings";
import { emailSupportBlock, getWhatsAppMessage, normalizeE164 } from "@/lib/whatsapp";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEsimEmail(data: {
  to: string;
  customerName: string;
  planName: string;
  qrCodeUrl: string;
  activationCode: string;
  smdpAddress: string;
  orderPublicId: string;
  referralLink?: string;
  refCode?: string;
}) {
  const referralSection = data.referralLink
    ? `
      <div style="margin-top:24px;padding:16px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd">
        <h2 style="color:#0369a1;font-size:16px;margin:0 0 8px">Indique e ganhe R$ 10</h2>
        <p style="color:#334155;font-size:14px;margin:0 0 12px">
          Compartilhe seu link com amigos. Eles ganham R$ 10 na primeira compra e você também ganha R$ 10 quando pagarem.
        </p>
        <p style="font-family:monospace;font-size:13px;background:#fff;padding:8px;border-radius:4px;word-break:break-all">
          ${data.referralLink}
        </p>
        ${data.refCode ? `<p style="color:#64748b;font-size:12px;margin:8px 0 0">Código: <strong>${data.refCode}</strong></p>` : ""}
      </div>
    `
    : "";

  const supportEmail = await getSetting("support_email");
  const whatsappNumber = normalizeE164(await getSetting("whatsapp_number"));
  const supportSection = emailSupportBlock({
    supportEmail,
    whatsappNumber: whatsappNumber || undefined,
    whatsappMessage: getWhatsAppMessage(`/pedido/${data.orderPublicId}`),
  });

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
      ${referralSection}
      ${supportSection}
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

export async function sendMarginAlertEmail(data: {
  to: string;
  minMarginPercent: number;
  usdRate: number;
  plans: {
    planName: string;
    retailPriceBrl: number;
    currentMargin: number;
    suggestedPrice: number;
  }[];
}) {
  const rows = data.plans
    .map(
      (p) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${p.planName}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">R$ ${p.retailPriceBrl.toFixed(2)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;color:#dc2626">${p.currentMargin.toFixed(1)}%</td>
          <td style="padding:8px;border-bottom:1px solid #eee">R$ ${p.suggestedPrice.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto">
      <h1 style="color:#0EA5E9">ChipViagem — Alerta de margem</h1>
      <p><strong>${data.plans.length}</strong> plano(s) com margem abaixo de <strong>${data.minMarginPercent}%</strong>.</p>
      <p>Cotação USD/BRL usada: <strong>${data.usdRate.toFixed(4)}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:8px;text-align:left">Plano</th>
            <th style="padding:8px;text-align:left">Preço atual</th>
            <th style="padding:8px;text-align:left">Margem</th>
            <th style="padding:8px;text-align:left">Preço sugerido</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://chipviagem.com.br"}/admin/planos?risco=1">Ver planos em risco no admin</a></p>
      <hr/>
      <p style="color:#666;font-size:12px">ChipViagem — Altivia CNPJ 63.101.423/0001-18</p>
    </div>
  `;

  if (!resend) {
    console.log("[DEV] Alerta de margem não enviado:", { count: data.plans.length, to: data.to });
    return { id: "dev-mock" };
  }

  return resend.emails.send({
    from: "ChipViagem <noreply@chipviagem.com.br>",
    to: data.to,
    subject: `⚠️ ${data.plans.length} plano(s) com margem abaixo de ${data.minMarginPercent}%`,
    html,
  });
}

export async function sendReviewRequestEmail(data: {
  to: string;
  html: string;
  destinationName: string;
}) {
  if (!resend) {
    console.log("[DEV] E-mail de avaliação não enviado:", { to: data.to, destination: data.destinationName });
    console.log("[DEV] HTML length:", data.html.length);
    return { id: "dev-mock" };
  }

  return resend.emails.send({
    from: "ChipViagem <noreply@chipviagem.com.br>",
    to: data.to,
    subject: `Como foi a internet na sua viagem para ${data.destinationName}?`,
    html: data.html,
  });
}

export async function sendReferralRewardEmail(data: {
  to: string;
  html: string;
  rewardCode: string;
}) {
  if (!resend) {
    console.log("[DEV] E-mail de recompensa de indicação não enviado:", {
      to: data.to,
      rewardCode: data.rewardCode,
    });
    return { id: "dev-mock" };
  }

  return resend.emails.send({
    from: "ChipViagem <noreply@chipviagem.com.br>",
    to: data.to,
    subject: `🎉 Você ganhou R$ 10 — seu amigo comprou com sua indicação!`,
    html: data.html,
  });
}
