"use client";

import { useTransition } from "react";
import { formatDataMb } from "@/lib/utils";
import { updatePlanAction } from "@/app/admin/planos/actions";
import type { Plan } from "@/db/schema";
import type { MarginStatus } from "@/lib/margin";

const STATUS_STYLES: Record<MarginStatus, { dot: string; label: string }> = {
  green: { dot: "bg-green-500", label: "Saudável" },
  yellow: { dot: "bg-yellow-500", label: "Atenção" },
  red: { dot: "bg-red-500", label: "Em risco" },
};

interface PlanRowProps {
  plan: Plan;
  currentMargin: number;
  marginStatus: MarginStatus;
  usdRate: number;
  minMargin: number;
}

export function PlanRow({ plan, currentMargin, marginStatus, usdRate, minMargin }: PlanRowProps) {
  const [pending, startTransition] = useTransition();
  const style = STATUS_STYLES[marginStatus];

  function submit(formData: FormData) {
    startTransition(async () => {
      await updatePlanAction(formData);
    });
  }

  return (
    <tr className={pending ? "opacity-60" : undefined} data-risk={marginStatus === "red" ? "1" : "0"}>
      <td className="px-4 py-3">{plan.name}</td>
      <td className="px-4 py-3 text-slate-500">{plan.region}</td>
      <td className="px-4 py-3">{formatDataMb(plan.dataAmountMb)}</td>
      <td className="px-4 py-3">{plan.validityDays}d</td>
      <td className="px-4 py-3">${plan.wholesalePriceUsd}</td>
      <td className="px-4 py-3">
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
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} title={style.label} />
          <span className="text-sm font-medium">{currentMargin.toFixed(1)}%</span>
        </div>
        <p className="text-xs text-slate-400">mín. {minMargin}%</p>
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">USD {usdRate.toFixed(2)}</td>
    </tr>
  );
}
