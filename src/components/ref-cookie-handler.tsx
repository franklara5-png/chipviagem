"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { REFERRAL_COOKIE_MAX_AGE, REFERRAL_COOKIE_NAME } from "@/lib/referrals";

export function RefCookieHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;

    const normalized = ref.trim().toUpperCase();
    if (!normalized) return;

    document.cookie = `${REFERRAL_COOKIE_NAME}=${normalized}; path=/; max-age=${REFERRAL_COOKIE_MAX_AGE}; SameSite=Lax`;
  }, [searchParams]);

  return null;
}

export function getRefFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${REFERRAL_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]).toUpperCase() : null;
}
