"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getProvider } from "@/lib/providers";
import {
  calculateMarginPercent,
  getSetting,
  suggestRetailPrice,
} from "@/lib/settings";
import { slugify } from "@/lib/utils";

async function ensureAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Não autorizado");
}

export async function syncCatalogAction() {
  await ensureAdmin();

  const provider = getProvider();
  const catalog = await provider.getCatalog();
  const providerName = process.env.ESIM_PROVIDER ?? "mock";
  const usdRate = parseFloat(await getSetting("usd_brl_rate"));
  const defaultMargin = parseFloat(await getSetting("default_margin_percent"));

  for (const item of catalog) {
    const slug = slugify(item.name);
    const retailPrice = suggestRetailPrice(item.wholesalePriceUsd, usdRate, defaultMargin);
    const margin = calculateMarginPercent(retailPrice, item.wholesalePriceUsd, usdRate);

    const [existing] = await db
      .select()
      .from(plans)
      .where(eq(plans.providerPlanId, item.id))
      .limit(1);

    if (existing) {
      await db
        .update(plans)
        .set({
          name: item.name,
          countryCodes: item.countryCodes,
          region: item.region,
          dataAmountMb: item.dataAmountMb,
          validityDays: item.validityDays,
          wholesalePriceUsd: item.wholesalePriceUsd.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(plans.id, existing.id));
    } else {
      await db.insert(plans).values({
        providerPlanId: item.id,
        provider: providerName,
        slug,
        name: item.name,
        countryCodes: item.countryCodes,
        region: item.region,
        dataAmountMb: item.dataAmountMb,
        validityDays: item.validityDays,
        wholesalePriceUsd: item.wholesalePriceUsd.toFixed(2),
        retailPriceBrl: retailPrice.toFixed(2),
        marginPercent: margin.toFixed(2),
      });
    }
  }

  revalidatePath("/admin/planos");
}

export async function updatePlanAction(formData: FormData) {
  await ensureAdmin();

  const id = formData.get("id")?.toString();
  if (!id) throw new Error("ID inválido");

  const retailPriceBrl = formData.get("retailPriceBrl")?.toString();
  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  const [plan] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  if (!plan) throw new Error("Plano não encontrado");

  const usdRate = parseFloat(await getSetting("usd_brl_rate"));
  const retail = retailPriceBrl ? parseFloat(retailPriceBrl) : parseFloat(plan.retailPriceBrl);
  const wholesale = parseFloat(plan.wholesalePriceUsd);
  const margin = calculateMarginPercent(retail, wholesale, usdRate);

  await db
    .update(plans)
    .set({
      retailPriceBrl: retail.toFixed(2),
      marginPercent: margin.toFixed(2),
      isActive,
      isFeatured,
      updatedAt: new Date(),
    })
    .where(eq(plans.id, id));

  revalidatePath("/admin/planos");
}
