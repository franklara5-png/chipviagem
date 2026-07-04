import { and, count, eq, gte, isNotNull } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { db } from "@/db";
import { coupons, orders, referrals } from "@/db/schema";
import { sendReferralRewardEmail } from "@/lib/email";
import { getWhatsAppEmailProps } from "@/lib/whatsapp";
import { render } from "@react-email/render";
import { ReferralRewardEmail } from "../../emails/referral-reward";

const refCodeAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export const REFERRAL_FRIEND_DISCOUNT_BRL = 10;
export const REFERRAL_MIN_ORDER_BRL = 39;
export const REFERRAL_REWARD_BRL = 10;
export const REFERRAL_MAX_REWARDS = 20;
export const REFERRAL_COOKIE_NAME = "cv_ref";
export const REFERRAL_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export function getReferralLink(refCode: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chipviagem.com.br";
  return `${siteUrl}/?ref=${refCode}`;
}

export async function getOrCreateReferralForOrder(orderId: string) {
  const [existing] = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerOrderId, orderId))
    .limit(1);

  if (existing) return existing;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.status !== "delivered") return null;

  let refCode = refCodeAlphabet();
  for (let attempt = 0; attempt < 5; attempt++) {
    const [collision] = await db
      .select({ id: referrals.id })
      .from(referrals)
      .where(eq(referrals.refCode, refCode))
      .limit(1);
    if (!collision) break;
    refCode = refCodeAlphabet();
  }

  const [referral] = await db
    .insert(referrals)
    .values({
      referrerOrderId: orderId,
      referrerEmail: order.customerEmail,
      refCode,
    })
    .returning();

  await db.insert(coupons).values({
    code: refCode,
    type: "fixed",
    value: String(REFERRAL_FRIEND_DISCOUNT_BRL),
    minOrderBrl: String(REFERRAL_MIN_ORDER_BRL),
    maxUses: 1,
    origin: "referral",
    isActive: true,
  });

  return referral;
}

export async function getReferralByRefCode(refCode: string) {
  const [referral] = await db
    .select()
    .from(referrals)
    .where(eq(referrals.refCode, refCode.toUpperCase()))
    .limit(1);
  return referral ?? null;
}

export async function countReferrerRewards(referrerEmail: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(referrals)
    .where(and(eq(referrals.referrerEmail, referrerEmail), isNotNull(referrals.convertedAt)));
  return Number(row?.total ?? 0);
}

export async function hasPreviousPurchase(email: string, cpf: string): Promise<boolean> {
  const [row] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        eq(orders.status, "delivered"),
        eq(orders.customerEmail, email.toLowerCase())
      )
    )
    .limit(1);

  if (row) return true;

  const [byCpf] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.status, "delivered"), eq(orders.customerCpf, cpf)))
    .limit(1);

  return !!byCpf;
}

export async function validateReferralCoupon(
  refCode: string,
  orderAmountBrl: number,
  customerEmail: string,
  customerCpf: string
): Promise<{ valid: boolean; error?: string; referralId?: string }> {
  const referral = await getReferralByRefCode(refCode);
  if (!referral) return { valid: false, error: "Código de indicação inválido" };

  if (referral.convertedAt) {
    return { valid: false, error: "Este código de indicação já foi utilizado" };
  }

  const [referrerOrder] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, referral.referrerOrderId))
    .limit(1);

  if (!referrerOrder) return { valid: false, error: "Indicação inválida" };

  const email = customerEmail.trim().toLowerCase();
  const cpf = customerCpf.replace(/\D/g, "");

  if (email === referral.referrerEmail.toLowerCase()) {
    return { valid: false, error: "Você não pode usar seu próprio código de indicação" };
  }

  if (cpf === referrerOrder.customerCpf) {
    return { valid: false, error: "Você não pode usar seu próprio código de indicação" };
  }

  const rewards = await countReferrerRewards(referral.referrerEmail);
  if (rewards >= REFERRAL_MAX_REWARDS) {
    return { valid: false, error: "Este código de indicação atingiu o limite de uso" };
  }

  if (orderAmountBrl < REFERRAL_MIN_ORDER_BRL) {
    return {
      valid: false,
      error: `Pedido mínimo de R$ ${REFERRAL_MIN_ORDER_BRL.toFixed(2).replace(".", ",")} para usar indicação`,
    };
  }

  const isFirstPurchase = !(await hasPreviousPurchase(email, cpf));
  if (!isFirstPurchase) {
    return { valid: false, error: "Desconto de indicação válido apenas na primeira compra" };
  }

  return { valid: true, referralId: referral.id };
}

export async function processReferralConversion(friendOrderId: string) {
  const [friendOrder] = await db.select().from(orders).where(eq(orders.id, friendOrderId)).limit(1);
  if (!friendOrder?.couponId) return;

  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, friendOrder.couponId)).limit(1);
  if (!coupon || coupon.origin !== "referral") return;

  const [referral] = await db
    .select()
    .from(referrals)
    .where(eq(referrals.refCode, coupon.code))
    .limit(1);

  if (!referral || referral.convertedAt) return;

  const [referrerOrder] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, referral.referrerOrderId))
    .limit(1);

  if (!referrerOrder) return;

  const rewardCode = `BONUS-${refCodeAlphabet()}`;

  const [rewardCoupon] = await db
    .insert(coupons)
    .values({
      code: rewardCode,
      type: "fixed",
      value: String(REFERRAL_REWARD_BRL),
      minOrderBrl: String(REFERRAL_MIN_ORDER_BRL),
      maxUses: 1,
      origin: "referral",
      isActive: true,
    })
    .returning();

  await db
    .update(referrals)
    .set({
      friendOrderId,
      rewardCouponId: rewardCoupon.id,
      convertedAt: new Date(),
    })
    .where(eq(referrals.id, referral.id));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chipviagem.com.br";
  const html = await render(
    ReferralRewardEmail({
      referrerName: referrerOrder.customerName,
      rewardCode,
      rewardValue: REFERRAL_REWARD_BRL,
      siteUrl,
      ...(await getWhatsAppEmailProps()),
    })
  );

  await sendReferralRewardEmail({
    to: referral.referrerEmail,
    html,
    rewardCode,
  });
}

export async function getReferralStats30d() {
  const days30 = new Date();
  days30.setDate(days30.getDate() - 30);

  const convertedReferrals = await db
    .select({
      friendOrderId: referrals.friendOrderId,
      amountBrl: orders.amountBrl,
    })
    .from(referrals)
    .innerJoin(orders, eq(referrals.friendOrderId, orders.id))
    .where(and(isNotNull(referrals.convertedAt), gte(referrals.convertedAt, days30)));

  const conversions30d = convertedReferrals.length;
  const revenue30d = convertedReferrals.reduce((sum, row) => sum + parseFloat(row.amountBrl), 0);

  return { conversions30d, revenue30d };
}
