import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { getProvider } from "../src/lib/providers";
import { slugify } from "../src/lib/utils";
import { suggestRetailPrice } from "../src/lib/settings";
import { allDestinations } from "../src/lib/destinations/seed";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Iniciando seed...");

  const usdRate = parseFloat(process.env.USD_BRL_RATE ?? "5.50");
  const marginPercent = parseFloat(process.env.DEFAULT_MARGIN_PERCENT ?? "40");

  for (const dest of allDestinations) {
    await db
      .insert(schema.destinations)
      .values({
        slug: dest.slug,
        name: dest.name,
        countryCode: dest.countryCode,
        region: dest.region,
        flagEmoji: dest.flagEmoji,
        heroText: dest.heroText,
        intro: dest.intro,
        tipsJson: dest.tipsJson,
        faqJson: dest.faqJson,
        relatedPostSlugs: dest.relatedPostSlugs,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: schema.destinations.slug,
        set: {
          name: dest.name,
          countryCode: dest.countryCode,
          region: dest.region,
          flagEmoji: dest.flagEmoji,
          heroText: dest.heroText,
          intro: dest.intro,
          tipsJson: dest.tipsJson,
          faqJson: dest.faqJson,
          relatedPostSlugs: dest.relatedPostSlugs,
        },
      });
  }
  console.log(`✓ ${allDestinations.length} destinos`);

  const provider = getProvider();
  const catalog = await provider.getCatalog();
  const providerName = process.env.ESIM_PROVIDER ?? "mock";

  for (const item of catalog) {
    const slug = slugify(item.name);
    const retailPrice = suggestRetailPrice(item.wholesalePriceUsd, usdRate, marginPercent);

    await db
      .insert(schema.plans)
      .values({
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
        marginPercent: marginPercent.toFixed(2),
        isActive: true,
        isFeatured: item.dataAmountMb === 3072 && item.validityDays === 7,
      })
      .onConflictDoUpdate({
        target: schema.plans.slug,
        set: {
          wholesalePriceUsd: item.wholesalePriceUsd.toFixed(2),
          name: item.name,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`✓ ${catalog.length} planos`);

  const settings = [
    { key: "default_margin_percent", value: marginPercent.toString() },
    { key: "min_margin_percent", value: process.env.MIN_MARGIN_PERCENT ?? "25" },
    { key: "auto_reprice_enabled", value: "false" },
    { key: "usd_brl_rate", value: usdRate.toString() },
    { key: "support_email", value: "suporte@chipviagem.com.br" },
  ];
  for (const s of settings) {
    await db.insert(schema.settings).values(s).onConflictDoNothing();
  }
  console.log("✓ Configurações padrão");

  console.log("✅ Seed concluído!");
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
