"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import Link from "next/link";
import { User, LogOut } from "lucide-react";

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isPending) return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />;

  if (!session?.user) {
    return (
      <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition">
        Entrar
      </Link>
    );
  }

  const user = session.user;
  const initial = user.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 hover:opacity-80 transition-opacity" aria-label="Menu do usuário">
        {user.image ? <img src={user.image} alt={user.name ?? ""} className="w-8 h-8 rounded-full" /> :
        <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">{initial}</div>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-sm font-medium truncate text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <Link href="/painel" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)}>
            <User className="w-4 h-4" /> Minha conta
          </Link>
          <button onClick={() => signOut()} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      )}
    </div>
  );
}
