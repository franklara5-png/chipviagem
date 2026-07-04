"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number | null;
  comment: string | null;
  customerFirstName: string;
}

export function ReviewsCarousel({ reviews }: { reviews: ReviewItem[] }) {
  const rated = reviews.filter((r) => r.rating !== null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (rated.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % rated.length), 5000);
    return () => clearInterval(id);
  }, [rated.length]);

  if (rated.length === 0) return null;

  const current = rated[index];

  return (
    <section className="bg-primary/5 px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-ink">Avaliações de clientes</h2>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-opacity">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-5 w-5 ${
                  n <= (current.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                }`}
              />
            ))}
          </div>
          {current.comment && (
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              &ldquo;{current.comment}&rdquo;
            </p>
          )}
          <p className="mt-4 font-medium text-ink">— {current.customerFirstName}</p>
        </div>
        {rated.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {rated.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full transition ${
                  i === index ? "bg-primary" : "bg-slate-300"
                }`}
                aria-label={`Avaliação ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
