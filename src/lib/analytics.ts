import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";

export const WHATSAPP_CLICK_EVENT = "whatsapp_click";

export async function trackAnalyticsEvent(event: string, path: string) {
  await db.insert(analyticsEvents).values({ event, path });
}

export async function getWhatsAppClicks7d(): Promise<number> {
  const days7 = new Date();
  days7.setDate(days7.getDate() - 7);

  const [row] = await db
    .select({ total: count() })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.event, WHATSAPP_CLICK_EVENT),
        gte(analyticsEvents.createdAt, days7)
      )
    );

  return Number(row?.total ?? 0);
}
