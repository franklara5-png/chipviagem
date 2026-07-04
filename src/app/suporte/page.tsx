import { PublicLayout } from "@/components/layout/public-layout";
import { getSeoMetadata } from "@/lib/seo";
import { getSetting } from "@/lib/settings";
import {
  buildWhatsAppUrl,
  formatWhatsAppDisplay,
  isValidE164,
  normalizeE164,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata = getSeoMetadata({
  title: "Suporte",
  description: "Entre em contato com o suporte ChipViagem. Atendimento em português para dúvidas sobre eSIM.",
  path: "/suporte",
});

export default async function SuportePage() {
  const supportEmail = await getSetting("support_email").catch(() => "suporte@chipviagem.com.br");
  const whatsappRaw = await getSetting("whatsapp_number").catch(() => "");
  const whatsappNumber = normalizeE164(whatsappRaw);
  const hasWhatsApp = isValidE164(whatsappNumber);
  const whatsappUrl = hasWhatsApp
    ? buildWhatsAppUrl(whatsappNumber, "Olá! Vim do site ChipViagem e tenho uma dúvida")
    : "";

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-ink">Suporte</h1>
        <p className="mt-4 text-slate-600">
          Nossa equipe está pronta para ajudar com instalação, ativação e qualquer dúvida sobre seu eSIM.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {hasWhatsApp && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <h2 className="font-semibold text-ink">WhatsApp</h2>
              <p className="mt-1 text-sm text-slate-600">Atendimento mais rápido — resposta em minutos.</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: "#25D366" }}
              >
                Chamar no WhatsApp
              </a>
              <p className="mt-2 text-sm text-slate-500">{formatWhatsAppDisplay(whatsappNumber)}</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-ink">E-mail</h2>
            <a href={`mailto:${supportEmail}`} className="mt-2 block text-primary hover:underline">
              {supportEmail}
            </a>
            <p className="mt-4 text-sm text-slate-500">Respondemos em até 24 horas úteis.</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="font-semibold text-ink">Dúvidas comuns</h2>
          <details className="rounded-lg border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium">Não recebi o e-mail com o QR code</summary>
            <p className="mt-2 text-sm text-slate-600">
              Verifique a caixa de spam. Você também pode acessar seu pedido diretamente pela página de confirmação
              ou pelo link enviado após a compra.
            </p>
          </details>
          <details className="rounded-lg border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium">O QR code não funciona no meu celular</summary>
            <p className="mt-2 text-sm text-slate-600">
              Confirme se seu aparelho suporta eSIM. Em alguns Android, é necessário inserir o código de ativação
              manualmente nas configurações de rede.
            </p>
          </details>
        </div>
      </div>
    </PublicLayout>
  );
}
