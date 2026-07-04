import { Star } from "lucide-react";
import type { Review } from "@/db/schema";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
        />
      ))}
    </div>
  );
}

interface ReviewsListProps {
  reviews: Review[];
  title?: string;
}

export function ReviewsList({ reviews, title = "O que nossos clientes dizem" }: ReviewsListProps) {
  const rated = reviews.filter((r) => r.rating !== null);
  if (rated.length === 0) return null;

  return (
    <section className="py-10">
      <h2 className="mb-6 text-2xl font-bold text-ink">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {rated.map((review) => (
          <blockquote
            key={review.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <Stars rating={review.rating!} />
            {review.comment && (
              <p className="mt-3 text-sm leading-relaxed text-slate-600">&ldquo;{review.comment}&rdquo;</p>
            )}
            <footer className="mt-3 text-sm font-medium text-ink">— {review.customerFirstName}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

export function aggregateRatingJsonLd(data: {
  ratingValue: number;
  reviewCount: number;
  productName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.productName,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: data.ratingValue,
      reviewCount: data.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}
