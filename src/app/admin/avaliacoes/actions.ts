"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

async function ensureAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Não autorizado");
}

export async function moderateReviewAction(formData: FormData) {
  await ensureAdmin();

  const id = formData.get("id")?.toString();
  const action = formData.get("action")?.toString();

  if (!id || !action) throw new Error("Dados inválidos");

  const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : null;
  if (!status) throw new Error("Ação inválida");

  await db
    .update(reviews)
    .set({ status, moderatedAt: new Date() })
    .where(eq(reviews.id, id));

  revalidatePath("/admin/avaliacoes");
}
