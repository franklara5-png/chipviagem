import { desc } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { formatBrl } from "@/lib/utils";
import { createCouponAction, deleteCouponAction, toggleCouponAction } from "./actions";

export default async function CuponsPage() {
  const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt));

  const manualCoupons = allCoupons.filter((c) => c.origin === "manual");
  const referralCoupons = allCoupons.filter((c) => c.origin === "referral");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Cupons</h1>
        <p className="text-sm text-slate-500">Gerencie cupons manuais e acompanhe cupons de indicação.</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-600">Criar cupom manual</h2>
        <form action={createCouponAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="code" className="block text-sm text-slate-700">
              Código
            </label>
            <input
              id="code"
              name="code"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase"
              placeholder="PROMO10"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm text-slate-700">
              Tipo
            </label>
            <select
              id="type"
              name="type"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="fixed">Valor fixo (R$)</option>
              <option value="percent">Percentual (%)</option>
            </select>
          </div>
          <div>
            <label htmlFor="value" className="block text-sm text-slate-700">
              Valor
            </label>
            <input
              id="value"
              name="value"
              type="number"
              step="0.01"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="min_order_brl" className="block text-sm text-slate-700">
              Pedido mínimo (R$)
            </label>
            <input
              id="min_order_brl"
              name="min_order_brl"
              type="number"
              step="0.01"
              defaultValue="0"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="max_uses" className="block text-sm text-slate-700">
              Máx. usos (vazio = ilimitado)
            </label>
            <input
              id="max_uses"
              name="max_uses"
              type="number"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="expires_at" className="block text-sm text-slate-700">
              Expira em
            </label>
            <input
              id="expires_at"
              name="expires_at"
              type="datetime-local"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Criar cupom
            </button>
          </div>
        </form>
      </section>

      <CouponTable title="Cupons manuais" coupons={manualCoupons} editable />
      <CouponTable title="Cupons de indicação" coupons={referralCoupons} editable={false} />
    </div>
  );
}

function CouponTable({
  title,
  coupons: rows,
  editable,
}: {
  title: string;
  coupons: (typeof coupons.$inferSelect)[];
  editable: boolean;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-4 text-sm font-medium text-slate-600">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum cupom.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-2 pr-4">Código</th>
                <th className="pb-2 pr-4">Desconto</th>
                <th className="pb-2 pr-4">Mínimo</th>
                <th className="pb-2 pr-4">Usos</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((coupon) => (
                <tr key={coupon.id} className="border-b border-slate-50">
                  <td className="py-2 pr-4 font-mono text-xs">{coupon.code}</td>
                  <td className="py-2 pr-4">
                    {coupon.type === "percent"
                      ? `${coupon.value}%`
                      : formatBrl(coupon.value)}
                  </td>
                  <td className="py-2 pr-4">{formatBrl(coupon.minOrderBrl)}</td>
                  <td className="py-2 pr-4">
                    {coupon.usedCount}
                    {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        coupon.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {coupon.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <form action={toggleCouponAction}>
                        <input type="hidden" name="coupon_id" value={coupon.id} />
                        <input type="hidden" name="is_active" value={String(!coupon.isActive)} />
                        <button type="submit" className="text-xs text-primary hover:underline">
                          {coupon.isActive ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                      {editable && (
                        <form action={deleteCouponAction}>
                          <input type="hidden" name="coupon_id" value={coupon.id} />
                          <button type="submit" className="text-xs text-red-600 hover:underline">
                            Excluir
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
