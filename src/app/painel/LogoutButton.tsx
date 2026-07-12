"use client";

import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button onClick={() => signOut()}
      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
      <LogOut className="w-4 h-4" /> Sair da conta
    </button>
  );
}
