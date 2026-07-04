import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import {
  REFERRAL_FRIEND_DISCOUNT_BRL,
  getReferralByRefCode,
  validateReferralCoupon,
} from "@/lib/referrals";

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  couponId?: string;
  discountBrl?: number;
  finalAmountBrl?: number;
}

function calculateDiscount(
  coupon: { type: "percent" | "fixed"; value: string },
  orderAmountBrl: number
): number {
  if (coupon.type === "percent") {
    const percent = parseFloat(coupon.value);
    return Math.min(orderAmountBrl, (orderAmountBrl * percent) / 100);
  }
  return Math.min(orderAmountBrl, parseFloat(coupon.value));
}

export async function validateCoupon(
  code: string,
  orderAmountBrl: number,
  customerEmail?: string,
  customerCpf?: string
): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, normalizedCode))
    .limit(1);

  if (!coupon) {
    return { valid: false, error: "Cupom não encontrado" };
  }

  if (!coupon.isActive) {
    return { valid: false, error: "Cupom inativo" };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: "Cupom expirado" };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Cupom esgotado" };
  }

  const minOrder = parseFloat(coupon.minOrderBrl);
  if (orderAmountBrl < minOrder) {
    return {
      valid: false,
      error: `Pedido mínimo de R$ ${minOrder.toFixed(2).replace(".", ",")} para este cupom`,
    };
  }

  if (coupon.origin === "referral") {
    const referral = await getReferralByRefCode(normalizedCode);

    if (referral) {
      if (!customerEmail || !customerCpf) {
        return { valid: false, error: "Informe e-mail e CPF para validar indicação" };
      }

      const referralCheck = await validateReferralCoupon(
        normalizedCode,
        orderAmountBrl,
        customerEmail,
        customerCpf
      );

      if (!referralCheck.valid) {
        return { valid: false, error: referralCheck.error };
      }

      const discountBrl = REFERRAL_FRIEND_DISCOUNT_BRL;
      return {
        valid: true,
        couponId: coupon.id,
        discountBrl,
        finalAmountBrl: Math.max(0.01, orderAmountBrl - discountBrl),
      };
    }
  }

  const discountBrl = calculateDiscount(coupon, orderAmountBrl);
  if (discountBrl <= 0) {
    return { valid: false, error: "Cupom sem desconto aplicável" };
  }

  return {
    valid: true,
    couponId: coupon.id,
    discountBrl,
    finalAmountBrl: Math.max(0.01, orderAmountBrl - discountBrl),
  };
}

export async function incrementCouponUsage(couponId: string) {
  await db
    .update(coupons)
    .set({ usedCount: sql`${coupons.usedCount} + 1` })
    .where(eq(coupons.id, couponId));
}

export async function getActiveCoupons(origin?: "manual" | "referral") {
  const now = new Date();
  let query = db
    .select()
    .from(coupons)
    .where(
      and(
        eq(coupons.isActive, true),
        or(isNull(coupons.expiresAt), gt(coupons.expiresAt, now))
      )
    )
    .orderBy(coupons.createdAt);

  const all = await query;
  if (origin) return all.filter((c) => c.origin === origin);
  return all;
}
