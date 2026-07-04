"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  MapPin,
  Users,
  Settings,
  Webhook,
  LogOut,
  Star,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/planos", label: "Planos", icon: Package },
  { href: "/admin/destinos", label: "Destinos", icon: MapPin },
  { href: "/admin/avaliacoes", label: "Avaliações", icon: Star },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/config", label: "Configurações", icon: Settings },
  { href: "/admin/webhooks", label: "Webhooks", icon: Webhook },
];

export function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col bg-slate-900 text-slate-200">
      <div className="border-b border-slate-700 px-4 py-5">
        <p className="text-sm font-semibold text-white">ChipViagem</p>
        <p className="text-xs text-slate-400">Painel Admin</p>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
