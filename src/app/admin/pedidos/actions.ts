"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { esims, orders, plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { provisionOrder } from "@/lib/orders";
import { sendEsimEmail } from "@/lib/email";

async function ensureAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Não autorizado");
  return admin;
}

async function reprocessOrder(orderId: string) {
  await ensureAdmin();

  const [existingEsim] = await db.select().from(esims).where(eq(esims.orderId, orderId)).limit(1);
  if (existingEsim) {
    await db.delete(esims).where(eq(esims.orderId, orderId));
  }

  await db
    .update(orders)
    .set({ status: "paid", deliveredAt: null, providerOrderId: null })
    .where(eq(orders.id, orderId));

  const result = await provisionOrder(orderId);
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");

  if (!result.success) {
    throw new Error(result.error ?? "Falha ao reprocessar");
  }
}

async function resendEmail(orderId: string) {
  await ensureAdmin();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Pedido não encontrado");

  const [plan] = await db.select().from(plans).where(eq(plans.id, order.planId)).limit(1);
  const [esim] = await db.select().from(esims).where(eq(esims.orderId, orderId)).limit(1);

  if (!plan || !esim) {
    throw new Error("eSIM ainda não provisionado");
  }

  await sendEsimEmail({
    to: order.customerEmail,
    customerName: order.customerName,
    planName: plan.name,
    qrCodeUrl: esim.qrCodeUrl,
    activationCode: esim.activationCode,
    smdpAddress: esim.smdpAddress,
    orderPublicId: order.publicId,
  });
}

async function markRefunded(orderId: string) {
  await ensureAdmin();

  await db
    .update(orders)
    .set({ status: "refunded" })
    .where(eq(orders.id, orderId));

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

export async function reprocessOrderFormAction(formData: FormData) {
  const orderId = formData.get("orderId")?.toString();
  if (!orderId) throw new Error("ID inválido");
  await reprocessOrder(orderId);
}

export async function resendEmailFormAction(formData: FormData) {
  const orderId = formData.get("orderId")?.toString();
  if (!orderId) throw new Error("ID inválido");
  await resendEmail(orderId);
}

export async function markRefundedFormAction(formData: FormData) {
  const orderId = formData.get("orderId")?.toString();
  if (!orderId) throw new Error("ID inválido");
  await markRefunded(orderId);
}
