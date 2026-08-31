import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { PublicLayout } from "@/components/layout/public-layout";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { formatBrl, formatDataMb } from "@/lib/utils";
import { getSession } from "@/lib/get-session";
import { CheckoutForm } from "./checkout-form";
import { getSeoMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Checkout nao deve ser indexado: conteudo fino e duplicado por plano.
export const metadata = getSeoMetadata({ title: "Checkout", noIndex: true });

interface CheckoutPageProps {
  params: Promise<{ planSlug: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { planSlug } = await params;

  // Sessão opcional — pré-preenche nome/email
  const session = await getSession().catch(() => null);
  const defaultName = session?.user?.name;
  const defaultEmail = session?.user?.email;

  const [plan] = await db
    .select()
    .from(plans)
    .where(eq(plans.slug, planSlug))
    .limit(1);

  if (!plan || !plan.isActive) {
    notFound();
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Finalizar compra</h1>
          <p className="mt-2 text-ink-soft">{plan.name}</p>
          <div className="mt-3 flex justify-center gap-4 text-sm text-ink-soft">
            <span>{plan.region}</span>
            <span>{formatDataMb(plan.dataAmountMb)}</span>
            <span>{plan.validityDays} dias</span>
            <span className="font-semibold text-primary">{formatBrl(plan.retailPriceBrl)}</span>
          </div>
        </div>

        <CheckoutForm plan={plan} defaultName={defaultName} defaultEmail={defaultEmail} />
      </div>
    </PublicLayout>
  );
}
