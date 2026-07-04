import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

export async function GET(request: NextRequest) {
  const publicId = request.nextUrl.searchParams.get("publicId");

  if (!publicId) {
    return NextResponse.json({ error: "publicId é obrigatório" }, { status: 400 });
  }

  const [order] = await db
    .select({
      publicId: orders.publicId,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
    })
    .from(orders)
    .where(eq(orders.publicId, publicId))
    .limit(1);

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  return NextResponse.json(order);
}
