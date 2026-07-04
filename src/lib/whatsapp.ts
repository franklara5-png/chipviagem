const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export function isValidE164(number: string): boolean {
  return E164_REGEX.test(number.trim());
}

export function normalizeE164(number: string): string {
  const trimmed = number.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed.replace(/\s/g, "");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return `+${digits}`;
}

export function formatWhatsAppDisplay(number: string): string {
  const e164 = normalizeE164(number);
  if (!e164) return "";
  if (e164.startsWith("+55") && e164.length >= 13) {
    const ddd = e164.slice(3, 5);
    const rest = e164.slice(5);
    if (rest.length === 9) {
      return `+55 (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
    }
    if (rest.length === 8) {
      return `+55 (${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }
  }
  return e164;
}

function formatDestinationSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getWhatsAppMessage(pathname: string): string {
  const pedidoMatch = pathname.match(/^\/pedido\/([^/]+)/);
  if (pedidoMatch) {
    return `Olá! Preciso de ajuda com meu pedido ${pedidoMatch[1]}`;
  }

  const destinoMatch = pathname.match(/^\/chip-de-viagem\/([^/]+)/);
  if (destinoMatch) {
    const destino = formatDestinationSlug(destinoMatch[1]);
    return `Olá! Tenho uma dúvida sobre o chip para ${destino}`;
  }

  return "Olá! Vim do site ChipViagem e tenho uma dúvida";
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const e164 = normalizeE164(number);
  const digits = e164.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function emailSupportBlock(data: {
  supportEmail: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
}): string {
  const waNumber = data.whatsappNumber ? normalizeE164(data.whatsappNumber) : "";
  const waUrl =
    waNumber && data.whatsappMessage
      ? buildWhatsAppUrl(waNumber, data.whatsappMessage)
      : waNumber
        ? buildWhatsAppUrl(waNumber, "Olá! Vim do site ChipViagem e tenho uma dúvida")
        : "";

  const whatsappRow = waUrl
    ? `<p style="margin:8px 0 0"><strong>WhatsApp:</strong> <a href="${waUrl}" style="color:#25D366">${formatWhatsAppDisplay(waNumber)}</a></p>`
    : "";

  return `
    <div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
      <p style="margin:0 0 8px;color:#334155;font-size:14px"><strong>Precisa de ajuda?</strong></p>
      <p style="margin:0;color:#334155;font-size:14px"><strong>E-mail:</strong> <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
      ${whatsappRow}
    </div>
  `;
}

export async function getWhatsAppEmailProps() {
  const { getSetting } = await import("@/lib/settings");
  const supportEmail = await getSetting("support_email");
  const number = normalizeE164(await getSetting("whatsapp_number"));

  if (!isValidE164(number)) {
    return { supportEmail, whatsappUrl: undefined, whatsappDisplay: undefined };
  }

  return {
    supportEmail,
    whatsappUrl: buildWhatsAppUrl(number, "Olá! Vim do site ChipViagem e tenho uma dúvida"),
    whatsappDisplay: formatWhatsAppDisplay(number),
  };
}
