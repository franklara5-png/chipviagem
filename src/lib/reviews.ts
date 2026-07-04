import { db } from "@/db";
import { destinations, orders, plans, reviews } from "@/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { addDays, startOfDay, isSameDay } from "date-fns";
import { customAlphabet } from "nanoid";
import { render } from "@react-email/render";
import ReviewRequestEmail from "../../emails/review-request";
import { sendReviewRequestEmail } from "@/lib/email";
import { getWhatsAppEmailProps } from "@/lib/whatsapp";
import type { Plan } from "@/db/schema";

const tokenAlphabet = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 32);

export async function resolveDestinationSlug(plan: Plan): Promise<string> {
  const code = plan.countryCodes[0];
  if (code === "EU") return "europa";
  if (code === "GLOBAL") return "global";
  if (code === "ASIA") return "asia";
  if (code === "SAM") return "america-do-sul";

  const [dest] = await db
    .select({ slug: destinations.slug })
    .from(destinations)
    .where(eq(destinations.countryCode, code))
    .limit(1);

  return dest?.slug ?? slugifyRegion(plan.region);
}

function slugifyRegion(region: string): string {
  return region
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
}

export async function resolveDestinationName(slug: string): Promise<string> {
  const [dest] = await db
    .select({ name: destinations.name })
    .from(destinations)
    .where(eq(destinations.slug, slug))
    .limit(1);
  return dest?.name ?? slug;
}

function isReviewDue(order: {
  travelDate: Date | null;
  deliveredAt: Date | null;
}, today: Date): boolean {
  if (order.travelDate) {
    const target = startOfDay(addDays(startOfDay(order.travelDate), 3));
    return isSameDay(target, today) || target < today;
  }
  if (order.deliveredAt) {
    const target = startOfDay(addDays(startOfDay(order.deliveredAt), 10));
    return target <= today;
  }
  return false;
}

export async function runReviewRequestCron() {
  const today = startOfDay(new Date());
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chipviagem.com.br";

  const eligibleOrders = await db
    .select({
      order: orders,
      plan: plans,
    })
    .from(orders)
    .innerJoin(plans, eq(orders.planId, plans.id))
    .leftJoin(reviews, eq(reviews.orderId, orders.id))
    .where(
      and(
        eq(orders.status, "delivered"),
        isNull(orders.reviewRequestSentAt),
        isNull(reviews.id)
      )
    );

  let sent = 0;

  for (const { order, plan } of eligibleOrders) {
    if (!isReviewDue(order, today)) continue;

    const token = tokenAlphabet();
    const destinationSlug = await resolveDestinationSlug(plan);
    const destinationName = await resolveDestinationName(destinationSlug);
    const firstName = order.customerName.split(" ")[0];

    await db.insert(reviews).values({
      orderId: order.id,
      token,
      customerFirstName: firstName,
      destinationSlug,
      status: "pending",
    });

    const html = await render(
      ReviewRequestEmail({
        customerName: order.customerName,
        destinationName,
        token,
        siteUrl,
        ...(await getWhatsAppEmailProps()),
      })
    );

    await sendReviewRequestEmail({
      to: order.customerEmail,
      html,
      destinationName,
    });

    await db
      .update(orders)
      .set({ reviewRequestSentAt: new Date() })
      .where(eq(orders.id, order.id));

    sent++;
  }

  return { sent };
}

export async function getReviewByToken(token: string) {
  const [row] = await db.select().from(reviews).where(eq(reviews.token, token)).limit(1);
  return row ?? null;
}

export async function submitReview(data: {
  token: string;
  rating: number;
  comment?: string;
  customerFirstName: string;
}) {
  const review = await getReviewByToken(data.token);
  if (!review) return { error: "Avaliação não encontrada" as const };
  if (review.rating !== null) return { error: "Esta avaliação já foi enviada" as const };
  if (data.rating < 1 || data.rating > 5) return { error: "Nota inválida" as const };

  await db
    .update(reviews)
    .set({
      rating: data.rating,
      comment: data.comment?.trim() || null,
      customerFirstName: data.customerFirstName.trim(),
      status: "pending",
    })
    .where(eq(reviews.id, review.id));

  return { success: true as const };
}

export async function getApprovedReviews(options?: {
  destinationSlug?: string;
  limit?: number;
}) {
  const limit = options?.limit ?? 20;

  let query = db
    .select()
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(sql`${reviews.createdAt} DESC`)
    .limit(limit);

  const rows = await query;
  if (options?.destinationSlug) {
    return rows.filter((r) => r.destinationSlug === options.destinationSlug);
  }
  return rows;
}

export async function getApprovedReviewsForDestination(
  destinationSlug: string,
  minGeneral = 3
) {
  const destReviews = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.status, "approved"), eq(reviews.destinationSlug, destinationSlug)))
    .orderBy(sql`${reviews.createdAt} DESC`)
    .limit(10);

  if (destReviews.length >= minGeneral) return destReviews;

  const general = await db
    .select()
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(sql`${reviews.createdAt} DESC`)
    .limit(10);

  const seen = new Set(destReviews.map((r) => r.id));
  const combined = [...destReviews];
  for (const r of general) {
    if (!seen.has(r.id) && combined.length < 10) {
      combined.push(r);
      seen.add(r.id);
    }
  }
  return combined;
}

export async function getAggregateRating(destinationSlug?: string) {
  const condition = destinationSlug
    ? and(eq(reviews.status, "approved"), eq(reviews.destinationSlug, destinationSlug))
    : eq(reviews.status, "approved");

  const rows = await db
    .select({ rating: reviews.rating })
    .from(reviews)
    .where(condition);

  const rated = rows.filter((r) => r.rating !== null);
  if (rated.length < 3) return null;

  const sum = rated.reduce((s, r) => s + (r.rating ?? 0), 0);
  return {
    ratingValue: Math.round((sum / rated.length) * 10) / 10,
    reviewCount: rated.length,
  };
}

export async function getReviewStats() {
  const all = await db.select({ status: reviews.status, rating: reviews.rating }).from(reviews);
  const pending = all.filter((r) => r.status === "pending" && r.rating !== null).length;
  const approved = all.filter((r) => r.status === "approved" && r.rating !== null);
  const avg =
    approved.length > 0
      ? approved.reduce((s, r) => s + (r.rating ?? 0), 0) / approved.length
      : 0;

  return {
    pendingModeration: pending,
    averageRating: Math.round(avg * 10) / 10,
    totalApproved: approved.length,
  };
}
