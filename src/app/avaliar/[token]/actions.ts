"use server";

import { submitReview } from "@/lib/reviews";

export async function submitReviewAction(data: {
  token: string;
  rating: number;
  comment: string;
  customerFirstName: string;
}) {
  return submitReview(data);
}
