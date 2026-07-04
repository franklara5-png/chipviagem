import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, webhookEvents } from "@/db/schema";
import { markOrderPaid } from "@/lib/orders";

const PAID_EVENTS = new Set(["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"]);

interface AsaasWebhookPayload {
  id?: string;
  event?: string;
  payment?: {
    id?: string;
    externalReference?: string;
  };
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("asaas-access-token");
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let payload: AsaasWebhookPayload;
  try {
    payload = (await request.json()) as AsaasWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const eventId = payload.id;
  const eventType = payload.event;

  if (!eventId || !eventType) {
    return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: webhookEvents.id })
    .from(webhookEvents)
    .where(eq(webhookEvents.eventId, eventId))
    .limit(1);

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await db.insert(webhookEvents).values({
    eventId,
    eventType,
    payload,
  });

  if (!PAID_EVENTS.has(eventType)) {
    await db
      .update(webhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(webhookEvents.eventId, eventId));

    return NextResponse.json({ ok: true, ignored: true });
  }

  const paymentId = payload.payment?.id;
  const externalReference = payload.payment?.externalReference;

  let order: (typeof orders.$inferSelect) | undefined;

  if (paymentId) {
    [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.asaasPaymentId, paymentId))
      .limit(1);
  }

  if (!order && externalReference) {
    [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.publicId, externalReference))
      .limit(1);
  }

  if (!order) {
    await db
      .update(webhookEvents)
      .set({ processedAt: new Date(), error: "Pedido não encontrado" })
      .where(eq(webhookEvents.eventId, eventId));

    return NextResponse.json({ ok: true, orderNotFound: true });
  }

  try {
    await markOrderPaid(order.id);

    await db
      .update(webhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(webhookEvents.eventId, eventId));

    return NextResponse.json({ ok: true, orderId: order.publicId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao processar pagamento";

    await db
      .update(webhookEvents)
      .set({ processedAt: new Date(), error: message })
      .where(eq(webhookEvents.eventId, eventId));

    console.error("[webhook/asaas]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
