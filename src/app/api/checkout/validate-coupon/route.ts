import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { validateCoupon } from "@/lib/coupons";

const schema = z.object({
  code: z.string().min(1),
  planSlug: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerCpf: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());

    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.slug, body.planSlug))
      .limit(1);

    if (!plan || !plan.isActive) {
      return NextResponse.json({ valid: false, error: "Plano não encontrado" }, { status: 404 });
    }

    const orderAmountBrl = parseFloat(plan.retailPriceBrl);
    const result = await validateCoupon(
      body.code,
      orderAmountBrl,
      body.customerEmail,
      body.customerCpf
    );

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ valid: false, error: "Dados inválidos" }, { status: 400 });
    }
    return NextResponse.json({ valid: false, error: "Erro ao validar cupom" }, { status: 500 });
  }
}
