import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { getReviewByToken, resolveDestinationName } from "@/lib/reviews";
import { getSeoMetadata } from "@/lib/seo";
import { ReviewForm } from "./review-form";

export const metadata = getSeoMetadata({
  title: "Avaliar sua experiência",
  path: "/avaliar",
  noIndex: true,
});

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ nota?: string }>;
}

export default async function AvaliarPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { nota } = await searchParams;

  const review = await getReviewByToken(token);
  if (!review) notFound();

  const destinationName = await resolveDestinationName(review.destinationSlug);
  const initialRating = Math.min(5, Math.max(0, parseInt(nota ?? "0", 10) || 0));
  const alreadySubmitted = review.rating !== null;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="font-display mb-6 text-center text-3xl font-extrabold tracking-tight text-ink">
          Avalie sua experiência
        </h1>
        <ReviewForm
          token={token}
          initialRating={initialRating}
          defaultName={review.customerFirstName}
          destinationName={destinationName}
          alreadySubmitted={alreadySubmitted}
        />
      </div>
    </PublicLayout>
  );
}
