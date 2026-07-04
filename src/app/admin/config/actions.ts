"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { isValidE164, normalizeE164 } from "@/lib/whatsapp";

async function ensureAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Não autorizado");
  return admin;
}

export async function updateSettingsAction(formData: FormData) {
  await ensureAdmin();

  const defaultMargin = formData.get("default_margin_percent")?.toString();
  const minMargin = formData.get("min_margin_percent")?.toString();
  const autoReprice = formData.get("auto_reprice_enabled") === "on" ? "true" : "false";
  const usdRate = formData.get("usd_brl_rate")?.toString();
  const supportEmail = formData.get("support_email")?.toString();
  const whatsappRaw = formData.get("whatsapp_number")?.toString() ?? "";

  if (defaultMargin) await setSetting("default_margin_percent", defaultMargin);
  if (minMargin) await setSetting("min_margin_percent", minMargin);
  await setSetting("auto_reprice_enabled", autoReprice);
  if (usdRate) await setSetting("usd_brl_rate", usdRate);
  if (supportEmail) await setSetting("support_email", supportEmail);

  const whatsappNumber = normalizeE164(whatsappRaw);
  if (whatsappNumber && !isValidE164(whatsappNumber)) {
    throw new Error("WhatsApp deve estar no formato E.164 (ex: +5511999999999)");
  }
  await setSetting("whatsapp_number", whatsappNumber);

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
