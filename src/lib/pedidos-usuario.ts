import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { orders, esims } from "@/db/schema";

export async function getPedidosPorEmail(email: string) {
  const rows = await db
    .select({
      id: orders.id,
      publicId: orders.publicId,
      planId: orders.planId,
      customerName: orders.customerName,
      status: orders.status,
      amountBrl: orders.amountBrl,
      createdAt: orders.createdAt,
      paidAt: orders.paidAt,
      deliveredAt: orders.deliveredAt,
    })
    .from(orders)
    .where(eq(orders.customerEmail, email))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  return rows;
}
