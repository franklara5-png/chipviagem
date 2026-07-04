"use client";

import { useCallback, useEffect, useState } from "react";
import { formatBrl, formatDataMb } from "@/lib/utils";
import { ReferralSection } from "@/components/referral-section";

interface OrderPlan {
  name: string;
  region: string;
  dataAmountMb: number;
  validityDays: number;
}

interface OrderEsim {
  iccid: string;
  qrCodeUrl: string;
  smdpAddress: string;
  activationCode: string;
  expiresAt: string | null;
}

interface OrderData {
  publicId: string;
  status: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  amountBrl: string;
  discountBrl?: string;
  createdAt: string;
  paidAt: string | null;
  deliveredAt: string | null;
  plan: OrderPlan;
  esim?: OrderEsim;
  referral?: {
    refCode: string;
    referralLink: string;
  };
}

interface OrderStatusProps {
  publicId: string;
}

const STATUS_LABELS: Record<string, { label: string; description: string; color: string }> = {
  pending: {
    label: "Aguardando pagamento",
    description: "Estamos aguardando a confirmação do seu pagamento.",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  paid: {
    label: "Pagamento confirmado",
    description: "Seu pagamento foi recebido. Preparando seu eSIM…",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  provisioning: {
    label: "Preparando eSIM",
    description: "Estamos gerando seu eSIM. Isso leva apenas alguns segundos.",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  delivered: {
    label: "eSIM entregue",
    description: "Seu eSIM está pronto! Confira os detalhes abaixo ou verifique seu e-mail.",
    color: "text-green-600 bg-green-50 border-green-200",
  },
  failed: {
    label: "Falha na entrega",
    description: "Houve um problema ao gerar seu eSIM. Entre em contato com o suporte.",
    color: "text-red-600 bg-red-50 border-red-200",
  },
  refunded: {
    label: "Reembolsado",
    description: "Este pedido foi reembolsado.",
    color: "text-slate-600 bg-slate-50 border-slate-200",
  },
};

const POLLING_STATUSES = new Set(["pending", "paid", "provisioning"]);

export function OrderStatus({ publicId }: OrderStatusProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${publicId}`);
      if (!res.ok) {
        throw new Error("Pedido não encontrado");
      }
      const data = (await res.json()) as OrderData;
      setOrder(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar pedido");
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!order || !POLLING_STATUSES.has(order.status)) return;

    const interval = setInterval(fetchOrder, 3000);
    return () => clearInterval(interval);
  }, [order, fetchOrder]);

  async function handleResend() {
    setResending(true);
    setResendMessage(null);

    try {
      const res = await fetch(`/api/orders/${publicId}/resend`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao reenviar e-mail");
      }

      setResendMessage("E-mail reenviado com sucesso!");
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : "Erro ao reenviar");
    } finally {
      setResending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-slate-500">Carregando pedido…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-700">{error ?? "Pedido não encontrado"}</p>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;

  return (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${statusInfo.color}`}>
        <div className="flex items-center gap-3">
          {POLLING_STATUSES.has(order.status) && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          <div>
            <p className="font-semibold">{statusInfo.label}</p>
            <p className="mt-0.5 text-sm opacity-80">{statusInfo.description}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Detalhes do pedido</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Pedido</dt>
            <dd className="font-mono font-medium text-ink">{order.publicId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Plano</dt>
            <dd className="font-medium text-ink">{order.plan.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Dados</dt>
            <dd className="text-ink">
              {formatDataMb(order.plan.dataAmountMb)} · {order.plan.validityDays} dias
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Valor</dt>
            <dd className="font-semibold text-primary">
              {parseFloat(order.discountBrl ?? "0") > 0 ? (
                <>
                  <span className="mr-2 text-sm font-normal text-slate-400 line-through">
                    {formatBrl(parseFloat(order.amountBrl) + parseFloat(order.discountBrl ?? "0"))}
                  </span>
                  {formatBrl(order.amountBrl)}
                </>
              ) : (
                formatBrl(order.amountBrl)
              )}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Pagamento</dt>
            <dd className="text-ink">{order.paymentMethod === "pix" ? "PIX" : "Cartão"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">E-mail</dt>
            <dd className="text-ink">{order.customerEmail}</dd>
          </div>
        </dl>
      </div>

      {order.status === "delivered" && order.esim && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Seu eSIM</h2>
          <p className="mt-1 text-sm text-slate-500">
            Escaneie o QR code no seu celular para instalar o eSIM.
          </p>

          <div className="mt-6 flex flex-col items-center gap-4">
            <img
              src={order.esim.qrCodeUrl}
              alt="QR Code eSIM"
              className="h-56 w-56 rounded-lg border border-slate-200"
            />

            <dl className="w-full space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Código de ativação</dt>
                <dd className="mt-0.5 break-all rounded bg-slate-50 px-3 py-2 font-mono text-xs text-ink">
                  {order.esim.activationCode}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Endereço SM-DP+</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-ink">{order.esim.smdpAddress}</dd>
              </div>
              <div>
                <dt className="text-slate-500">ICCID</dt>
                <dd className="mt-0.5 font-mono text-xs text-ink">{order.esim.iccid}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {resending ? "Reenviando…" : "Reenviar e-mail com eSIM"}
            </button>

            {resendMessage && (
              <p className="text-sm text-slate-600">{resendMessage}</p>
            )}
          </div>
        </div>
      )}

      {order.status === "delivered" && order.referral && (
        <ReferralSection
          refCode={order.referral.refCode}
          referralLink={order.referral.referralLink}
        />
      )}
    </div>
  );
}
