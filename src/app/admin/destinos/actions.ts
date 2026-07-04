"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function ensureAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Não autorizado");
}

export async function createDestinationAction(formData: FormData) {
  await ensureAdmin();

  const name = formData.get("name")?.toString().trim() ?? "";
  const countryCode = formData.get("countryCode")?.toString().trim().toUpperCase() ?? "";
  const region = formData.get("region")?.toString().trim() ?? "";
  const flagEmoji = formData.get("flagEmoji")?.toString().trim() ?? "";
  const heroText = formData.get("heroText")?.toString().trim() ?? "";
  const intro = formData.get("intro")?.toString().trim() ?? "";

  if (!name || !countryCode || !region) {
    throw new Error("Campos obrigatórios ausentes");
  }

  await db.insert(destinations).values({
    slug: slugify(name),
    name,
    countryCode,
    region,
    flagEmoji: flagEmoji || "🌍",
    heroText: heroText || name,
    intro,
  });

  revalidatePath("/admin/destinos");
}

export async function updateDestinationAction(formData: FormData) {
  await ensureAdmin();

  const id = formData.get("id")?.toString();
  if (!id) throw new Error("ID inválido");

  const name = formData.get("name")?.toString().trim() ?? "";
  const countryCode = formData.get("countryCode")?.toString().trim().toUpperCase() ?? "";
  const region = formData.get("region")?.toString().trim() ?? "";
  const flagEmoji = formData.get("flagEmoji")?.toString().trim() ?? "";
  const heroText = formData.get("heroText")?.toString().trim() ?? "";
  const intro = formData.get("intro")?.toString().trim() ?? "";
  const isActive = formData.get("isActive") === "on";

  await db
    .update(destinations)
    .set({
      slug: slugify(name),
      name,
      countryCode,
      region,
      flagEmoji,
      heroText,
      intro,
      isActive,
    })
    .where(eq(destinations.id, id));

  revalidatePath("/admin/destinos");
}

export async function deleteDestinationFormAction(formData: FormData) {
  await ensureAdmin();

  const id = formData.get("id")?.toString();
  if (!id) throw new Error("ID inválido");

  await db.delete(destinations).where(eq(destinations.id, id));
  revalidatePath("/admin/destinos");
}
