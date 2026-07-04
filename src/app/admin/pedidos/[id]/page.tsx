import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { esims, orders, plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatBrl, formatCpf } from "@/lib/utils";
import { getAsaasPanelUrl } from "@/lib/asaas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  reprocessOrderFormAction,
  resendEmailFormAction,
  markRefundedFormAction,
} from "../actions";
import { AcquisitionOrigin } from "@/components/admin/acquisition-origin";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  provisioning: "Provisionando",
  delivered: "Entregue",
  failed: "Falhou",
  refunded: "Reembolsado",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PedidoDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [row] = await db
    .select({
      order: orders,
      plan: plans,
      esim: esims,
    })
    .from(orders)
    .innerJoin(plans, eq(orders.planId, plans.id))
    .leftJoin(esims, eq(esims.orderId, orders.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!row) notFound();

  const { order, plan, esim } = row;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/pedidos" className="text-sm text-primary hover:underline">
          ← Voltar
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Pedido {order.publicId}</h1>
          <p className="text-sm text-slate-500">
            {STATUS_LABELS[order.status]} ·{" "}
            {format(order.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(order.status === "failed" || order.status === "paid") && (
            <form action={reprocessOrderFormAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Reprocessar
              </button>
            </form>
          )}
          {esim && (
            <form action={resendEmailFormAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Reenviar e-mail
              </button>
            </form>
          )}
          {order.status !== "refunded" && order.status !== "pending" && (
            <form action={markRefundedFormAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
              >
                Marcar reembolsado
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-slate-600">Cliente</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Nome</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">E-mail</dt>
              <dd>{order.customerEmail}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">CPF</dt>
              <dd>{formatCpf(order.customerCpf)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-slate-600">Pagamento</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Valor</dt>
              <dd className="font-medium">{formatBrl(order.amountBrl)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Método</dt>
              <dd className="uppercase">{order.paymentMethod}</dd>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Pago em</dt>
                <dd>{format(order.paidAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</dd>
              </div>
            )}
            {order.asaasPaymentId && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Asaas</dt>
                <dd>
                  <a
                    href={getAsaasPanelUrl(order.asaasPaymentId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Ver pagamento
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-slate-600">Plano</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Nome</dt>
              <dd>{plan.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Região</dt>
              <dd>{plan.region}</dd>
            </div>
            {order.providerOrderId && (
              <div className="flex justify-between">
                <dt className="text-slate-500">ID Provider</dt>
                <dd className="font-mono text-xs">{order.providerOrderId}</dd>
              </div>
            )}
          </dl>
        </section>

        {esim && (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-medium text-slate-600">eSIM</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">ICCID</dt>
                <dd className="font-mono text-xs">{esim.iccid}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">SM-DP+</dt>
                <dd className="text-xs">{esim.smdpAddress}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-slate-500">Código</dt>
                <dd className="break-all text-right font-mono text-xs">{esim.activationCode}</dd>
              </div>
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Entregue em</dt>
                  <dd>{format(order.deliveredAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</dd>
                </div>
              )}
            </dl>
            {esim.qrCodeUrl && (
              <img
                src={esim.qrCodeUrl}
                alt="QR Code eSIM"
                className="mt-4 h-40 w-40 rounded border border-slate-200"
              />
            )}
          </section>
        )}
      </div>

      <AcquisitionOrigin
        channel={order.channel}
        utmSource={order.utmSource}
        utmMedium={order.utmMedium}
        utmCampaign={order.utmCampaign}
        utmContent={order.utmContent}
        utmTerm={order.utmTerm}
        referrerDomain={order.referrerDomain}
        landingPage={order.landingPage}
      />
    </div>
  );
}
