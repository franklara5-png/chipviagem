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
    // Não há banco de desenvolvimento: o dev local aponta para o Neon de
    // produção, então sem esta guarda cada `npm run dev` insere visitas
    // falsas na mesma tabela que alimenta o dashboard.
    if (process.env.NODE_ENV !== "production") return;
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
