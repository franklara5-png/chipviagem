"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function createCouponAction(formData: FormData) {
  await requireAdmin();

  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  const type = String(formData.get("type") ?? "fixed") as "percent" | "fixed";
  const value = String(formData.get("value") ?? "0");
  const minOrderBrl = String(formData.get("min_order_brl") ?? "0");
  const maxUsesRaw = String(formData.get("max_uses") ?? "").trim();
  const expiresAtRaw = String(formData.get("expires_at") ?? "").trim();

  if (!code) throw new Error("Código obrigatório");

  await db.insert(coupons).values({
    code,
    type,
    value,
    minOrderBrl,
    maxUses: maxUsesRaw ? parseInt(maxUsesRaw, 10) : null,
    expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
    origin: "manual",
    isActive: true,
  });

  revalidatePath("/admin/cupons");
}

export async function toggleCouponAction(formData: FormData) {
  await requireAdmin();

  const couponId = String(formData.get("coupon_id") ?? "");
  const isActive = String(formData.get("is_active") ?? "") === "true";

  await db.update(coupons).set({ isActive }).where(eq(coupons.id, couponId));

  revalidatePath("/admin/cupons");
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdmin();

  const couponId = String(formData.get("coupon_id") ?? "");

  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, couponId)).limit(1);
  if (!coupon || coupon.origin !== "manual") {
    throw new Error("Apenas cupons manuais podem ser excluídos");
  }

  await db.delete(coupons).where(eq(coupons.id, couponId));

  revalidatePath("/admin/cupons");
}
