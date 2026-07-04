import Link from "next/link";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

interface RelatedDestinationsProps {
  slugs: string[];
}

export async function RelatedDestinations({ slugs }: RelatedDestinationsProps) {
  if (!slugs.length) return null;

  const dests = await db
    .select({ slug: destinations.slug, name: destinations.name, flagEmoji: destinations.flagEmoji })
    .from(destinations)
    .where(inArray(destinations.slug, slugs))
    .catch(() => []);

  if (!dests.length) return null;

  return (
    <section className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="mb-4 text-xl font-bold text-ink">Destinos relacionados</h2>
      <div className="flex flex-wrap gap-3">
        {dests.map((d) => (
          <Link
            key={d.slug}
            href={`/chip-de-viagem/${d.slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-primary hover:text-primary"
          >
            <span>{d.flagEmoji}</span>
            {d.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
