/**
 * IP e geolocalização a partir de headers da borda (Vercel), para o
 * rastreamento de visitas usado pelo Hermes (dashboard-frank).
 */

let regionNames: Intl.DisplayNames | null = null;
function getRegionNames(): Intl.DisplayNames {
  if (!regionNames) {
    regionNames = new Intl.DisplayNames(["pt-BR"], { type: "region" });
  }
  return regionNames;
}

function cleanIp(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  // IPv4-mapped IPv6 (::ffff:1.2.3.4) → mantém só a parte IPv4.
  const unwrapped = trimmed.replace(/^::ffff:/i, "");
  return unwrapped || null;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  return cleanIp(forwarded) || cleanIp(req.headers.get("x-real-ip")) || "unknown";
}

function decodeHeader(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Normaliza a sigla ISO-3166 (ex: "BR") para o nome do país em pt-BR. */
function getCountryName(code: string | null): string | undefined {
  const decoded = decodeHeader(code);
  if (!decoded) return undefined;
  try {
    return getRegionNames().of(decoded.toUpperCase()) ?? decoded;
  } catch {
    return decoded;
  }
}

export interface RequestLocation {
  city?: string;
  region?: string;
  country?: string;
}

export function getLocationFromHeaders(req: Request): RequestLocation {
  return {
    city: decodeHeader(req.headers.get("x-vercel-ip-city")),
    region: decodeHeader(req.headers.get("x-vercel-ip-country-region")),
    country: getCountryName(req.headers.get("x-vercel-ip-country")),
  };
}
