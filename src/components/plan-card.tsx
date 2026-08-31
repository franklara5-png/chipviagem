import Link from "next/link";
import { formatBrl, formatDataMb } from "@/lib/utils";
import type { Plan } from "@/db/schema";

interface PlanCardProps {
  plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="tilt-3d group relative flex flex-col overflow-hidden rounded-2xl border border-ink/6 bg-surface-raised p-6 shadow-[var(--shadow-lift)]">
      {/* Fio de gradiente no topo, só no plano em destaque. */}
      {plan.isFeatured && (
        <span
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: "var(--brand-gradient)" }}
        />
      )}

      {plan.isFeatured && (
        <span className="mb-3 w-fit rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent">
          Destaque
        </span>
      )}

      <h3 className="font-display text-xl font-bold text-ink">{plan.name}</h3>
      <p className="mt-1 text-sm text-ink-soft">{plan.region}</p>

      <div className="mt-4 flex gap-2">
        <span className="rounded-lg bg-surface px-3 py-1.5 text-sm font-semibold text-ink">
          {formatDataMb(plan.dataAmountMb)}
        </span>
        <span className="rounded-lg bg-surface px-3 py-1.5 text-sm font-semibold text-ink">
          {plan.validityDays} dias
        </span>
      </div>

      <p className="font-display mt-5 text-3xl font-extrabold">
        <span className="text-gradient">{formatBrl(plan.retailPriceBrl)}</span>
      </p>

      <Link
        href={`/checkout/${plan.slug}`}
        className="mt-5 block rounded-xl bg-[image:var(--brand-gradient)] py-3 text-center text-sm font-bold text-white shadow-[0_6px_20px_rgba(199,75,158,0.26)] transition-transform group-hover:-translate-y-0.5"
      >
        Comprar agora
      </Link>
    </div>
  );
}
