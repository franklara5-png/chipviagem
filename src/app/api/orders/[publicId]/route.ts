import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { esims, orders, plans, referrals } from "@/db/schema";
import { getReferralLink } from "@/lib/referrals";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await params;

  const [row] = await db
    .select({
      publicId: orders.publicId,
      status: orders.status,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      paymentMethod: orders.paymentMethod,
      amountBrl: orders.amountBrl,
      createdAt: orders.createdAt,
      paidAt: orders.paidAt,
      deliveredAt: orders.deliveredAt,
      planName: plans.name,
      planRegion: plans.region,
      planDataAmountMb: plans.dataAmountMb,
      planValidityDays: plans.validityDays,
      esimIccid: esims.iccid,
      esimQrCodeUrl: esims.qrCodeUrl,
      esimSmdpAddress: esims.smdpAddress,
      esimActivationCode: esims.activationCode,
      esimExpiresAt: esims.expiresAt,
      discountBrl: orders.discountBrl,
      refCode: referrals.refCode,
    })
    .from(orders)
    .innerJoin(plans, eq(orders.planId, plans.id))
    .leftJoin(esims, eq(esims.orderId, orders.id))
    .leftJoin(referrals, eq(referrals.referrerOrderId, orders.id))
    .where(eq(orders.publicId, publicId))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  const response: Record<string, unknown> = {
    publicId: row.publicId,
    status: row.status,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    paymentMethod: row.paymentMethod,
    amountBrl: row.amountBrl,
    discountBrl: row.discountBrl,
    createdAt: row.createdAt,
    paidAt: row.paidAt,
    deliveredAt: row.deliveredAt,
    plan: {
      name: row.planName,
      region: row.planRegion,
      dataAmountMb: row.planDataAmountMb,
      validityDays: row.planValidityDays,
    },
  };

  if (row.status === "delivered" && row.refCode) {
    response.referral = {
      refCode: row.refCode,
      referralLink: getReferralLink(row.refCode),
    };
  }

  if (row.status === "delivered" && row.esimQrCodeUrl) {
    response.esim = {
      iccid: row.esimIccid,
      qrCodeUrl: row.esimQrCodeUrl,
      smdpAddress: row.esimSmdpAddress,
      activationCode: row.esimActivationCode,
      expiresAt: row.esimExpiresAt,
    };
  }

  return NextResponse.json(response);
}
