"use client";

import { useState } from "react";
import { Gift, Copy, Check } from "lucide-react";
import { REFERRAL_FRIEND_DISCOUNT_BRL } from "@/lib/referrals";

interface ReferralSectionProps {
  refCode: string;
  referralLink: string;
}

export function ReferralSection({ refCode, referralLink }: ReferralSectionProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-sky-100 p-2">
          <Gift className="h-5 w-5 text-sky-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-ink">Indique e ganhe R$ 10</h2>
          <p className="mt-1 text-sm text-slate-600">
            Compartilhe seu link. Seu amigo ganha R$ {REFERRAL_FRIEND_DISCOUNT_BRL} na primeira compra e
            você também ganha R$ 10 quando ele pagar.
          </p>

          <div className="mt-4">
            <label className="text-xs font-medium text-slate-500">Seu link de indicação</label>
            <div className="mt-1 flex gap-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 truncate rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs text-slate-700"
              />
              <button
                type="button"
                onClick={copyLink}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Código: <span className="font-mono font-semibold text-ink">{refCode}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
