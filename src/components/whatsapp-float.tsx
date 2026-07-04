import { getSetting } from "@/lib/settings";
import { isValidE164, normalizeE164 } from "@/lib/whatsapp";
import { WhatsAppFloatButton } from "./whatsapp-float-button";

export async function WhatsAppFloat() {
  try {
    const raw = await getSetting("whatsapp_number");
    const number = normalizeE164(raw);

    if (!number || !isValidE164(number)) return null;

    return <WhatsAppFloatButton whatsappNumber={number} />;
  } catch {
    return null;
  }
}
