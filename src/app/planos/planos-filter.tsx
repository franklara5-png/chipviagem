"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PlanosFilterProps {
  regions: string[];
  currentRegion?: string;
  currentSort?: string;
}

export function PlanosFilter({ regions, currentRegion, currentSort }: PlanosFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/planos?${params.toString()}`);
  }

  return (
    <div className="mt-6 flex flex-wrap gap-4">
      <select
        value={currentRegion ?? ""}
        onChange={(e) => update("regiao", e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm"
      >
        <option value="">Todas as regiões</option>
        {regions.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <select
        value={currentSort ?? "preco-asc"}
        onChange={(e) => update("ordenar", e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm"
      >
        <option value="preco-asc">Menor preço</option>
        <option value="preco-desc">Maior preço</option>
      </select>
    </div>
  );
}
