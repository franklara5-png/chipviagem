"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isBotUserAgent, isTrackablePath } from "@/lib/visit-tracking";

/**
 * Envia uma visita para o Hermes (dashboard-frank) a cada troca de rota
 * pública. Fica no layout raiz porque cobre o site inteiro, mas o filtro de
 * rotas privadas/estáticas roda aqui (e de novo no servidor, em
 * /api/track/visit) — este componente nunca é a única barreira.
 */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (!isTrackablePath(pathname)) return;
    if (typeof navigator !== "undefined" && isBotUserAgent(navigator.userAgent)) return;

    fetch("/api/track/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // não bloqueia a navegação por causa do tracking
    });
  }, [pathname]);

  return null;
}
