"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { setSetting } from "@/lib/settings";

async function ensureAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Não autorizado");
  return admin;
}

export async function updateSettingsAction(formData: FormData) {
  await ensureAdmin();

  const defaultMargin = formData.get("default_margin_percent")?.toString();
  const usdRate = formData.get("usd_brl_rate")?.toString();
  const supportEmail = formData.get("support_email")?.toString();

  if (defaultMargin) await setSetting("default_margin_percent", defaultMargin);
  if (usdRate) await setSetting("usd_brl_rate", usdRate);
  if (supportEmail) await setSetting("support_email", supportEmail);

  revalidatePath("/admin/config");
}

export async function changePasswordAction(formData: FormData) {
  const admin = await ensureAdmin();

  const currentPassword = formData.get("currentPassword")?.toString() ?? "";
  const newPassword = formData.get("newPassword")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  if (!currentPassword || !newPassword) {
    throw new Error("Preencha todos os campos");
  }

  if (newPassword.length < 8) {
    throw new Error("Nova senha deve ter pelo menos 8 caracteres");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Senhas não conferem");
  }

  const valid = await verifyPassword(currentPassword, admin.passwordHash);
  if (!valid) {
    throw new Error("Senha atual incorreta");
  }

  const passwordHash = await hashPassword(newPassword);
  await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, admin.id));
}
