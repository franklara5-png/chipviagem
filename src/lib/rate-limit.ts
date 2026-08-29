/**
 * Rate limit por janela fixa, em memória.
 *
 * LIMITAÇÃO IMPORTANTE: o estado vive no processo. Em serverless cada
 * instância tem o seu próprio contador, então o teto real é
 * (limite × instâncias ativas). Isso corta o abuso trivial — um loop de
 * curl de uma origem só — mas não é uma barreira forte contra um atacante
 * distribuído.
 *
 * Para proteção durável, o caminho é rate limiting na borda (Vercel WAF)
 * ou um contador compartilhado (Redis/Postgres).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Evita o Map crescer sem limite se muitas chaves distintas aparecerem. */
const MAX_KEYS = 10_000;

function cleanup(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size > MAX_KEYS) buckets.clear();
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Segundos até a janela reabrir. */
  retryAfter: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (buckets.size > 0 && Math.random() < 0.01) cleanup(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);

  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfter };
  }

  return { ok: true, remaining: limit - bucket.count, retryAfter };
}

/**
 * IP do cliente. Na Vercel o x-forwarded-for é preenchido pela borda; o
 * primeiro item é o cliente real. Fora dela o valor é forjável, então isto
 * serve para limitar abuso casual, não para autenticar ninguém.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "desconhecido";
}
