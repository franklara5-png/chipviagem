import { db } from "@/db";
import { reviews } from "@/db/schema";
import { desc, isNotNull } from "drizzle-orm";
import { Star } from "lucide-react";
import { moderateReviewAction } from "./actions";
import { resolveDestinationName } from "@/lib/reviews";

export default async function AvaliacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status;

  let allReviews = await db
    .select()
    .from(reviews)
    .where(isNotNull(reviews.rating))
    .orderBy(desc(reviews.createdAt));

  if (statusFilter && ["pending", "approved", "rejected"].includes(statusFilter)) {
    allReviews = allReviews.filter((r) => r.status === statusFilter);
  }

  const destinationNames = await Promise.all(
    [...new Set(allReviews.map((r) => r.destinationSlug))].map(async (slug) => ({
      slug,
      name: await resolveDestinationName(slug),
    }))
  );
  const nameMap = Object.fromEntries(destinationNames.map((d) => [d.slug, d.name]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Avaliações</h1>

      <div className="flex flex-wrap gap-2 text-sm">
        {[
          { label: "Todas", value: "" },
          { label: "Pendentes", value: "pending" },
          { label: "Aprovadas", value: "approved" },
          { label: "Rejeitadas", value: "rejected" },
        ].map((f) => (
          <a
            key={f.value}
            href={f.value ? `/admin/avaliacoes?status=${f.value}` : "/admin/avaliacoes"}
            className={`rounded-full px-3 py-1 ${
              statusFilter === f.value || (!statusFilter && !f.value)
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="space-y-4">
        {allReviews.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma avaliação encontrada.</p>
        ) : (
          allReviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-4 w-4 ${
                            n <= (review.rating ?? 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        review.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : review.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {review.status === "approved"
                        ? "Aprovada"
                        : review.status === "rejected"
                          ? "Rejeitada"
                          : "Pendente"}
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-ink">{review.customerFirstName}</p>
                  <p className="text-sm text-slate-500">
                    {nameMap[review.destinationSlug] ?? review.destinationSlug} ·{" "}
                    {review.createdAt?.toLocaleString("pt-BR")}
                  </p>
                  {review.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}
                </div>

                {review.status === "pending" && (
                  <div className="flex gap-2">
                    <form action={moderateReviewAction}>
                      <input type="hidden" name="id" value={review.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button
                        type="submit"
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                      >
                        Aprovar
                      </button>
                    </form>
                    <form action={moderateReviewAction}>
                      <input type="hidden" name="id" value={review.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button
                        type="submit"
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Rejeitar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
