"use server";

import { redirect } from "next/navigation";
import { loginAdmin } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!email || !password) {
    redirect("/admin/login?error=credenciais");
  }

  const user = await loginAdmin(email, password);
  if (!user) {
    redirect("/admin/login?error=invalido");
  }

  redirect("/admin");
}
