import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { esims, orders, plans } from "@/db/schema";
import { sendEsimEmail } from "@/lib/email";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await params;

  const [row] = await db
    .select({
      orderId: orders.id,
      status: orders.status,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      planName: plans.name,
      esimQrCodeUrl: esims.qrCodeUrl,
      esimSmdpAddress: esims.smdpAddress,
      esimActivationCode: esims.activationCode,
    })
    .from(orders)
    .innerJoin(plans, eq(orders.planId, plans.id))
    .leftJoin(esims, eq(esims.orderId, orders.id))
    .where(eq(orders.publicId, publicId))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  if (row.status !== "delivered" || !row.esimQrCodeUrl) {
    return NextResponse.json(
      { error: "eSIM ainda não está disponível para reenvio" },
      { status: 400 }
    );
  }

  await sendEsimEmail({
    to: row.customerEmail,
    customerName: row.customerName,
    planName: row.planName,
    qrCodeUrl: row.esimQrCodeUrl,
    activationCode: row.esimActivationCode!,
    smdpAddress: row.esimSmdpAddress!,
    orderPublicId: publicId,
  });

  return NextResponse.json({ ok: true, message: "E-mail reenviado com sucesso" });
}
