"use client";

import { useTransition } from "react";
import { formatDataMb } from "@/lib/utils";
import { updatePlanAction } from "@/app/admin/planos/actions";
import type { Plan } from "@/db/schema";

export function PlanRow({ plan }: { plan: Plan }) {
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      await updatePlanAction(formData);
    });
  }

  return (
    <tr className={pending ? "opacity-60" : undefined}>
      <td className="px-4 py-3">{plan.name}</td>
      <td className="px-4 py-3 text-slate-500">{plan.region}</td>
      <td className="px-4 py-3">{formatDataMb(plan.dataAmountMb)}</td>
      <td className="px-4 py-3">{plan.validityDays}d</td>
      <td className="px-4 py-3">${plan.wholesalePriceUsd}</td>
      <td className="px-4 py-3" colSpan={4}>
        <form action={submit} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="id" value={plan.id} />
          <input
            name="retailPriceBrl"
            type="number"
            step="0.01"
            min="0"
            defaultValue={plan.retailPriceBrl}
            className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
          />
          <span className="text-slate-500">{plan.marginPercent ? `${plan.marginPercent}%` : "—"}</span>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" name="isActive" defaultChecked={plan.isActive} />
            Ativo
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" name="isFeatured" defaultChecked={plan.isFeatured} />
            Destaque
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-primary-dark disabled:opacity-50"
          >
            Salvar
          </button>
        </form>
      </td>
    </tr>
  );
}
