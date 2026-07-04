import { db } from "@/db";
import { esims, orders, plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getProvider } from "@/lib/providers";
import { sendEsimEmail } from "@/lib/email";

export async function provisionOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return { success: false, error: "Pedido não encontrado" };

  if (order.status === "delivered") return { success: true };

  const [plan] = await db.select().from(plans).where(eq(plans.id, order.planId)).limit(1);
  if (!plan) return { success: false, error: "Plano não encontrado" };

  try {
    await db.update(orders).set({ status: "provisioning" }).where(eq(orders.id, orderId));

    const provider = getProvider();
    const providerOrder = await provider.createOrder(plan.providerPlanId, order.publicId);

    await db
      .update(orders)
      .set({ providerOrderId: providerOrder.providerOrderId })
      .where(eq(orders.id, orderId));

    const esimDetails = await provider.getEsimDetails(providerOrder.providerOrderId);

    await db.insert(esims).values({
      orderId: order.id,
      iccid: esimDetails.iccid,
      qrCodeUrl: esimDetails.qrCodeUrl,
      smdpAddress: esimDetails.smdpAddress,
      activationCode: esimDetails.activationCode,
      expiresAt: esimDetails.expiresAt,
    });

    await db
      .update(orders)
      .set({ status: "delivered", deliveredAt: new Date() })
      .where(eq(orders.id, orderId));

    await sendEsimEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      planName: plan.name,
      qrCodeUrl: esimDetails.qrCodeUrl,
      activationCode: esimDetails.activationCode,
      smdpAddress: esimDetails.smdpAddress,
      orderPublicId: order.publicId,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    await db.update(orders).set({ status: "failed" }).where(eq(orders.id, orderId));
    return { success: false, error: message };
  }
}

export async function markOrderPaid(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.status !== "pending") return;

  await db
    .update(orders)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(orders.id, orderId));

  await provisionOrder(orderId);
}
