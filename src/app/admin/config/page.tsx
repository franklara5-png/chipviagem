import { getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/auth";
import { updateSettingsAction, changePasswordAction } from "./actions";

export default async function ConfigPage() {
  const admin = await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Configurações</h1>
        <p className="text-sm text-slate-500">Logado como {admin?.email}</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-600">Configurações gerais</h2>
        <form action={updateSettingsAction} className="max-w-md space-y-4">
          <div>
            <label htmlFor="min_margin_percent" className="block text-sm text-slate-700">
              Margem mínima (%)
            </label>
            <input
              id="min_margin_percent"
              name="min_margin_percent"
              type="number"
              step="0.1"
              defaultValue={settings.min_margin_percent}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Planos abaixo disso ficam em vermelho no admin e disparam alerta por e-mail.
            </p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="auto_reprice_enabled"
                defaultChecked={settings.auto_reprice_enabled === "true"}
              />
              Reajuste automático de preços
            </label>
            <p className="mt-1 text-xs text-slate-500">
              No cron diário, planos em risco são reajustados para margem mínima + 5pp (preço ,90).
            </p>
          </div>
          <div>
            <label htmlFor="default_margin_percent" className="block text-sm text-slate-700">
              Margem padrão ao importar (%)
            </label>
            <input
              id="default_margin_percent"
              name="default_margin_percent"
              type="number"
              step="0.1"
              defaultValue={settings.default_margin_percent}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="usd_brl_rate" className="block text-sm text-slate-700">
              Câmbio USD/BRL (fallback manual)
            </label>
            <input
              id="usd_brl_rate"
              name="usd_brl_rate"
              type="number"
              step="0.01"
              defaultValue={settings.usd_brl_rate}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="support_email" className="block text-sm text-slate-700">
              E-mail de suporte
            </label>
            <input
              id="support_email"
              name="support_email"
              type="email"
              defaultValue={settings.support_email}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="whatsapp_number" className="block text-sm text-slate-700">
              WhatsApp (E.164)
            </label>
            <input
              id="whatsapp_number"
              name="whatsapp_number"
              type="tel"
              placeholder="+5511999999999"
              defaultValue={settings.whatsapp_number}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Formato internacional com DDI. Exibe o botão flutuante em todas as páginas públicas.
            </p>
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Salvar configurações
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-600">Alterar senha</h2>
        <form action={changePasswordAction} className="max-w-md space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm text-slate-700">
              Senha atual
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm text-slate-700">
              Nova senha
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-slate-700">
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Alterar senha
          </button>
        </form>
      </section>
    </div>
  );
}
