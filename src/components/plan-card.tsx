import Link from "next/link";
import { formatBrl, formatDataMb } from "@/lib/utils";
import type { Plan } from "@/db/schema";

interface PlanCardProps {
  plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {plan.isFeatured && (
        <span className="mb-2 w-fit rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
          Destaque
        </span>
      )}
      <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{plan.region}</p>
      <div className="mt-3 flex gap-4 text-sm text-slate-600">
        <span>{formatDataMb(plan.dataAmountMb)}</span>
        <span>{plan.validityDays} dias</span>
      </div>
      <p className="mt-4 text-2xl font-bold text-primary">
        {formatBrl(plan.retailPriceBrl)}
      </p>
      <Link
        href={`/checkout/${plan.slug}`}
        className="mt-4 block rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        Comprar agora
      </Link>
    </div>
  );
}
