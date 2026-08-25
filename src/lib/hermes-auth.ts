import { timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Autenticação do dashboard-frank (Hermes) para rotas internas de stats.
 * Aceita `Authorization: Bearer <chave>` ou `x-hermes-key: <chave>`.
 */
export function authorizeHermes(req: Request): boolean {
  const secret = process.env.HERMES_API_KEY?.trim();
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    if (safeEqual(auth.slice(7).trim(), secret)) return true;
  }

  const header = req.headers.get("x-hermes-key");
  if (header && safeEqual(header.trim(), secret)) return true;

  return false;
}
