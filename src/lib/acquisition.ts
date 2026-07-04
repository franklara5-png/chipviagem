import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export const ACQUISITION_COOKIE = "cv_acq";
export const ACQUISITION_MAX_AGE = 90 * 24 * 60 * 60;

export type AcquisitionChannel =
  | "organic"
  | "referral_program"
  | "social"
  | "link"
  | "campaign"
  | "direct"
  | "unknown";

export interface AcquisitionData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  ref?: string;
  referrer?: string;
  landingPage: string;
  firstVisitAt: string;
}

export interface OrderAcquisitionFields {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrerDomain: string | null;
  landingPage: string | null;
  channel: AcquisitionChannel;
}

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

function trimParam(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function extractReferrerDomain(referrer?: string): string | null {
  if (!referrer?.trim()) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

/**
 * First-touch: classificamos no momento do pedido, não no cookie,
 * para refletir o estado completo da primeira visita (ref + UTMs + referrer).
 */
export function classifyChannel(data: AcquisitionData): AcquisitionChannel {
  const hasUtm = !!(
    data.utmSource ||
    data.utmMedium ||
    data.utmCampaign ||
    data.utmContent ||
    data.utmTerm
  );

  if (data.ref) return "referral_program";
  if (hasUtm) return "campaign";

  const referrer = data.referrer?.toLowerCase() ?? "";
  if (!referrer) return "direct";

  const organicHosts = ["google.", "bing.", "duckduckgo."];
  if (organicHosts.some((h) => referrer.includes(h))) return "organic";

  const socialHosts = [
    "instagram.",
    "facebook.",
    "fb.",
    "tiktok.",
    "twitter.",
    "x.com",
    "youtube.",
    "reddit.",
  ];
  if (socialHosts.some((h) => referrer.includes(h))) return "social";

  return "link";
}

export function buildAcquisitionFromRequest(request: NextRequest): AcquisitionData {
  const { searchParams, pathname } = request.nextUrl;
  const refererHeader = request.headers.get("referer") ?? request.headers.get("referrer");

  return {
    utmSource: trimParam(searchParams.get("utm_source")),
    utmMedium: trimParam(searchParams.get("utm_medium")),
    utmCampaign: trimParam(searchParams.get("utm_campaign")),
    utmContent: trimParam(searchParams.get("utm_content")),
    utmTerm: trimParam(searchParams.get("utm_term")),
    ref: trimParam(searchParams.get("ref"))?.toUpperCase(),
    referrer: refererHeader?.trim() || undefined,
    landingPage: pathname || "/",
    firstVisitAt: new Date().toISOString(),
  };
}

export async function signAcquisitionCookie(data: AcquisitionData): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(getSecret());
}

export async function parseAcquisitionCookie(
  value: string | undefined
): Promise<AcquisitionData | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtVerify(value, getSecret());
    const landingPage = payload.landingPage;
    const firstVisitAt = payload.firstVisitAt;
    if (typeof landingPage !== "string" || typeof firstVisitAt !== "string") return null;

    return {
      utmSource: typeof payload.utmSource === "string" ? payload.utmSource : undefined,
      utmMedium: typeof payload.utmMedium === "string" ? payload.utmMedium : undefined,
      utmCampaign: typeof payload.utmCampaign === "string" ? payload.utmCampaign : undefined,
      utmContent: typeof payload.utmContent === "string" ? payload.utmContent : undefined,
      utmTerm: typeof payload.utmTerm === "string" ? payload.utmTerm : undefined,
      ref: typeof payload.ref === "string" ? payload.ref : undefined,
      referrer: typeof payload.referrer === "string" ? payload.referrer : undefined,
      landingPage,
      firstVisitAt,
    };
  } catch {
    return null;
  }
}

export function toOrderAcquisitionFields(
  data: AcquisitionData | null
): OrderAcquisitionFields {
  if (!data) {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      referrerDomain: null,
      landingPage: null,
      channel: "unknown",
    };
  }

  return {
    utmSource: data.utmSource ?? null,
    utmMedium: data.utmMedium ?? null,
    utmCampaign: data.utmCampaign ?? null,
    utmContent: data.utmContent ?? null,
    utmTerm: data.utmTerm ?? null,
    referrerDomain: extractReferrerDomain(data.referrer),
    landingPage: data.landingPage,
    channel: classifyChannel(data),
  };
}

export async function getAcquisitionFromRequest(
  request: NextRequest
): Promise<OrderAcquisitionFields> {
  try {
    const raw = request.cookies.get(ACQUISITION_COOKIE)?.value;
    const data = await parseAcquisitionCookie(raw);
    return toOrderAcquisitionFields(data);
  } catch {
    return toOrderAcquisitionFields(null);
  }
}

export const CHANNEL_LABELS: Record<AcquisitionChannel, string> = {
  organic: "Orgânico",
  referral_program: "Indicação",
  social: "Redes sociais",
  link: "Link externo",
  campaign: "Campanha (UTM)",
  direct: "Direto",
  unknown: "Desconhecido",
};
