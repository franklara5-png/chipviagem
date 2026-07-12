"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { formatBrl, formatCpf, formatDataMb } from "@/lib/utils";
import type { Plan } from "@/db/schema";
import { getRefFromCookie } from "@/components/ref-cookie-handler";
import { REFERRAL_FRIEND_DISCOUNT_BRL } from "@/lib/referrals";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface CheckoutFormProps {
  plan: Plan;
  defaultName?: string;
  defaultEmail?: string;
}

type PaymentMethod = "pix" | "card";
type Step = "form" | "pix" | "processing" | "error";

interface PixData {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export function CheckoutForm({ plan, defaultName, defaultEmail }: CheckoutFormProps) {
  const router = useRouter();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const [step, setStep] = useState<Step>("form");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [cpf, setCpf] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiryMonth, setCardExpiryMonth] = useState("");
  const [cardExpiryYear, setCardExpiryYear] = useState("");
  const [cardCcv, setCardCcv] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [phone, setPhone] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountBrl: number;
    finalAmountBrl: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [autoApplied, setAutoApplied] = useState(false);

  const retailPrice = parseFloat(plan.retailPriceBrl);
  const finalPrice = appliedCoupon?.finalAmountBrl ?? retailPrice;
  const discountAmount = appliedCoupon?.discountBrl ?? 0;

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  const renderTurnstile = useCallback(() => {
    if (!turnstileReady || !turnstileRef.current || !siteKey || !window.turnstile) return;

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      callback: (token) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => setTurnstileToken(""),
    });
  }, [turnstileReady, siteKey]);

  useEffect(() => {
    renderTurnstile();
  }, [renderTurnstile]);

  const applyCoupon = useCallback(
    async (code: string, silent = false) => {
      if (!code.trim()) return;
      setCouponLoading(true);
      if (!silent) setCouponError(null);

      try {
        const res = await fetch("/api/checkout/validate-coupon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: code.trim(),
            planSlug: plan.slug,
            customerEmail: email || undefined,
            customerCpf: cpf.replace(/\D/g, "") || undefined,
          }),
        });

        const data = await res.json();

        if (!data.valid) {
          if (!silent) setCouponError(data.error ?? "Cupom inválido");
          setAppliedCoupon(null);
          return;
        }

        setCouponCode(code.trim().toUpperCase());
        setAppliedCoupon({
          code: code.trim().toUpperCase(),
          discountBrl: data.discountBrl,
          finalAmountBrl: data.finalAmountBrl,
        });
        setCouponError(null);
      } catch {
        if (!silent) setCouponError("Erro ao validar cupom");
      } finally {
        setCouponLoading(false);
      }
    },
    [plan.slug, email, cpf]
  );

  useEffect(() => {
    if (!autoApplied || !couponCode) return;
    if (!email || cpf.replace(/\D/g, "").length !== 11) return;
    applyCoupon(couponCode, true);
  }, [email, cpf, autoApplied, couponCode, applyCoupon]);

  useEffect(() => {
    if (autoApplied) return;
    const refCode = getRefFromCookie();
    if (refCode) {
      setCouponCode(refCode);
      setAutoApplied(true);
    }
  }, [autoApplied]);

  useEffect(() => {
    if (!publicId || step !== "pix") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?publicId=${publicId}`);
        if (!res.ok) return;

        const data = (await res.json()) as { status: string };
        if (data.status !== "pending") {
          router.push(`/pedido/${publicId}`);
        }
      } catch {
        // polling silencioso
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [publicId, step, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        planSlug: plan.slug,
        customerName: name,
        customerEmail: email,
        customerCpf: cpf.replace(/\D/g, ""),
        paymentMethod,
        turnstileToken,
      };

      if (appliedCoupon) {
        payload.couponCode = appliedCoupon.code;
      }

      if (paymentMethod === "card") {
        payload.creditCard = {
          holderName: cardHolder,
          number: cardNumber.replace(/\D/g, ""),
          expiryMonth: cardExpiryMonth,
          expiryYear: cardExpiryYear.length === 2 ? `20${cardExpiryYear}` : cardExpiryYear,
          ccv: cardCcv,
        };
        payload.creditCardHolderInfo = {
          postalCode: postalCode.replace(/\D/g, ""),
          addressNumber,
          phone: phone.replace(/\D/g, ""),
        };
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao processar pagamento");
      }

      setPublicId(data.publicId);

      if (data.paymentMethod === "pix" && data.pix) {
        setPixData(data.pix);
        setStep("pix");
      } else {
        setStep("processing");
        router.push(`/pedido/${data.publicId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setTurnstileToken("");
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCpfChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setCpf(formatCpf(digits));
  }

  async function copyPixCode() {
    if (!pixData?.payload) return;
    await navigator.clipboard.writeText(pixData.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (step === "pix" && pixData) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Pague com PIX</h2>
        <p className="mt-2 text-sm text-slate-600">
          Escaneie o QR code ou copie o código abaixo. A confirmação é automática.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
          <img
            src={`data:image/png;base64,${pixData.encodedImage}`}
            alt="QR Code PIX"
            className="h-56 w-56 rounded-lg border border-slate-200"
          />

          <div className="w-full">
            <label className="text-xs font-medium text-slate-500">Código PIX copia e cola</label>
            <div className="mt-1 flex gap-2">
              <input
                readOnly
                value={pixData.payload}
                className="flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
              />
              <button
                type="button"
                onClick={copyPixCode}
                className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          {pixData.expirationDate && (
            <p className="text-xs text-slate-500">
              Válido até {new Date(pixData.expirationDate).toLocaleString("pt-BR")}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Aguardando confirmação do pagamento…
          </div>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 font-medium text-ink">Processando pagamento…</p>
        <p className="mt-1 text-sm text-slate-500">Redirecionando para o status do pedido.</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setTurnstileReady(true)}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Seus dados</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="João Silva"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="joao@email.com"
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-slate-700">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                required
                inputMode="numeric"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="000.000.000-00"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Forma de pagamento</h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("pix")}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
                paymentMethod === "pix"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              PIX
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
                paymentMethod === "card"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              Cartão de crédito
            </button>
          </div>

          {paymentMethod === "card" && (
            <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
              <div>
                <label htmlFor="cardHolder" className="block text-sm font-medium text-slate-700">
                  Nome no cartão
                </label>
                <input
                  id="cardHolder"
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700">
                  Número do cartão
                </label>
                <input
                  id="cardNumber"
                  type="text"
                  required
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0000 0000 0000 0000"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="expMonth" className="block text-sm font-medium text-slate-700">
                    Mês
                  </label>
                  <input
                    id="expMonth"
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={2}
                    value={cardExpiryMonth}
                    onChange={(e) => setCardExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="MM"
                  />
                </div>
                <div>
                  <label htmlFor="expYear" className="block text-sm font-medium text-slate-700">
                    Ano
                  </label>
                  <input
                    id="expYear"
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={4}
                    value={cardExpiryYear}
                    onChange={(e) => setCardExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="AAAA"
                  />
                </div>
                <div>
                  <label htmlFor="ccv" className="block text-sm font-medium text-slate-700">
                    CVV
                  </label>
                  <input
                    id="ccv"
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={4}
                    value={cardCcv}
                    onChange={(e) => setCardCcv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700">
                    CEP
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    required
                    inputMode="numeric"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="00000000"
                  />
                </div>
                <div>
                  <label htmlFor="addressNumber" className="block text-sm font-medium text-slate-700">
                    Número
                  </label>
                  <input
                    id="addressNumber"
                    type="text"
                    required
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Telefone
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="11999999999"
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Cupom de desconto</h2>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Código do cupom"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {appliedCoupon ? (
              <button
                type="button"
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponCode("");
                  setCouponError(null);
                }}
                className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Remover
              </button>
            ) : (
              <button
                type="button"
                onClick={() => applyCoupon(couponCode)}
                disabled={couponLoading || !couponCode.trim()}
                className="shrink-0 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                {couponLoading ? "…" : "Aplicar"}
              </button>
            )}
          </div>
          {appliedCoupon && (
            <p className="mt-2 text-sm text-green-600">
              Cupom aplicado! Desconto de {formatBrl(appliedCoupon.discountBrl)}
            </p>
          )}
          {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
          {autoApplied && appliedCoupon && (
            <p className="mt-2 text-xs text-slate-500">
              Desconto de indicação (R$ {REFERRAL_FRIEND_DISCOUNT_BRL}) aplicado automaticamente.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Total</span>
            <div className="text-right">
              {discountAmount > 0 && (
                <span className="mr-2 text-sm text-slate-400 line-through">
                  {formatBrl(retailPrice)}
                </span>
              )}
              <span className="text-2xl font-bold text-primary">{formatBrl(finalPrice)}</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {plan.name} · {formatDataMb(plan.dataAmountMb)} · {plan.validityDays} dias
          </p>
        </div>

        {siteKey && <div ref={turnstileRef} className="flex justify-center" />}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!!siteKey && !turnstileToken)}
          className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Processando…" : paymentMethod === "pix" ? "Gerar PIX" : "Pagar com cartão"}
        </button>
      </form>
    </>
  );
}
