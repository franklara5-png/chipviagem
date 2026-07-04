"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function PlanosRiskFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onlyRisk = searchParams.get("risco") === "1";

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (onlyRisk) params.delete("risco");
    else params.set("risco", "1");
    router.push(`/admin/planos?${params.toString()}`);
  }

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
      <input type="checkbox" checked={onlyRisk} onChange={toggle} />
      Só em risco
    </label>
  );
}
