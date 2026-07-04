import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders, plans } from "@/db/schema";
import {
  createCardPayment,
  createCustomer,
  createPixPayment,
  getPixQrCode,
  tokenizeCreditCard,
} from "@/lib/asaas";
import { verifyTurnstile } from "@/lib/turnstile";
import { generateNanoid, validateCpf } from "@/lib/utils";
import { validateCoupon } from "@/lib/coupons";

const checkoutSchema = z.object({
  planSlug: z.string().min(1),
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  customerCpf: z.string().min(11).max(14),
  paymentMethod: z.enum(["pix", "card"]),
  turnstileToken: z.string().min(1),
  couponCode: z.string().optional(),
  creditCard: z
    .object({
      holderName: z.string().min(2),
      number: z.string().min(13).max(19),
      expiryMonth: z.string().length(2),
      expiryYear: z.string().min(2).max(4),
      ccv: z.string().min(3).max(4),
    })
    .optional(),
  creditCardHolderInfo: z
    .object({
      postalCode: z.string().min(8),
      addressNumber: z.string().min(1),
      phone: z.string().min(10),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = checkoutSchema.parse(await request.json());

    const turnstileValid = await verifyTurnstile(body.turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json({ error: "Verificação de segurança falhou" }, { status: 403 });
    }

    if (!validateCpf(body.customerCpf)) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    if (body.paymentMethod === "card" && (!body.creditCard || !body.creditCardHolderInfo)) {
      return NextResponse.json(
        { error: "Dados do cartão são obrigatórios para pagamento com cartão" },
        { status: 400 }
      );
    }

    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.slug, body.planSlug))
      .limit(1);

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    const publicId = generateNanoid();
    const cpfDigits = body.customerCpf.replace(/\D/g, "");
    const retailPrice = parseFloat(plan.retailPriceBrl);

    let finalAmount = retailPrice;
    let discountBrl = 0;
    let couponId: string | undefined;

    if (body.couponCode?.trim()) {
      const couponResult = await validateCoupon(
        body.couponCode,
        retailPrice,
        body.customerEmail,
        cpfDigits
      );

      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error ?? "Cupom inválido" }, { status: 400 });
      }

      discountBrl = couponResult.discountBrl ?? 0;
      finalAmount = couponResult.finalAmountBrl ?? retailPrice;
      couponId = couponResult.couponId;
    }

    const amountBrl = finalAmount;

    const [order] = await db
      .insert(orders)
      .values({
        publicId,
        customerName: body.customerName.trim(),
        customerEmail: body.customerEmail.trim().toLowerCase(),
        customerCpf: cpfDigits,
        planId: plan.id,
        paymentMethod: body.paymentMethod,
        amountBrl: amountBrl.toFixed(2),
        discountBrl: discountBrl.toFixed(2),
        couponId,
        status: "pending",
      })
      .returning();

    const customer = await createCustomer({
      name: body.customerName,
      email: body.customerEmail,
      cpfCnpj: cpfDigits,
    });

    await db
      .update(orders)
      .set({ asaasCustomerId: customer.id })
      .where(eq(orders.id, order.id));

    const paymentDescription = `ChipViagem — ${plan.name}`;

    if (body.paymentMethod === "pix") {
      const payment = await createPixPayment({
        customerId: customer.id,
        value: amountBrl,
        description: paymentDescription,
        externalReference: publicId,
      });

      await db
        .update(orders)
        .set({ asaasPaymentId: payment.id })
        .where(eq(orders.id, order.id));

      const pixQr = await getPixQrCode(payment.id);

      return NextResponse.json({
        publicId,
        paymentMethod: "pix",
        pix: {
          encodedImage: pixQr.encodedImage,
          payload: pixQr.payload,
          expirationDate: pixQr.expirationDate,
        },
      });
    }

    const { creditCardToken } = await tokenizeCreditCard({
      customerId: customer.id,
      creditCard: body.creditCard!,
      creditCardHolderInfo: {
        name: body.customerName,
        email: body.customerEmail,
        cpfCnpj: cpfDigits,
        postalCode: body.creditCardHolderInfo!.postalCode.replace(/\D/g, ""),
        addressNumber: body.creditCardHolderInfo!.addressNumber,
        phone: body.creditCardHolderInfo!.phone.replace(/\D/g, ""),
      },
    });

    const payment = await createCardPayment({
      customerId: customer.id,
      value: amountBrl,
      description: paymentDescription,
      externalReference: publicId,
      creditCardToken,
    });

    await db
      .update(orders)
      .set({ asaasPaymentId: payment.id })
      .where(eq(orders.id, order.id));

    return NextResponse.json({
      publicId,
      paymentMethod: "card",
      card: {
        status: payment.status,
        invoiceUrl: payment.invoiceUrl,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: err.issues }, { status: 400 });
    }

    const message = err instanceof Error ? err.message : "Erro ao processar checkout";
    console.error("[checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
