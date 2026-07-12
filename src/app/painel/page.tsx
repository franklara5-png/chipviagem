import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { getPedidosPorEmail } from "@/lib/pedidos-usuario";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = { title: "Minha Conta", robots: { index: false, follow: false } };

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-amber-500" />,
  paid: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  provisioning: <Clock className="w-4 h-4 text-blue-500" />,
  delivered: <CheckCircle className="w-4 h-4 text-emerald-600" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
  refunded: <XCircle className="w-4 h-4 text-slate-400" />,
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente", paid: "Pago", provisioning: "Ativando", delivered: "Entregue",
  failed: "Falhou", refunded: "Reembolsado",
};

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatBrl(value: string | number | null): string {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PainelPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/painel");

  const user = session.user;
  const pedidosList = await getPedidosPorEmail(user.email);

  return (
    <main className="min-h-[60vh] px-4 py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          {user.image ? <img src={user.image} alt={user.name ?? ""} className="w-16 h-16 rounded-full mx-auto" /> :
          <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold mx-auto">
            {user.name?.charAt(0)?.toUpperCase() ?? "?"}</div>}
          <h1 className="text-2xl font-bold text-ink">Olá, {user.name?.split(" ")[0]}!</h1>
          <p className="text-slate-500 text-sm">{user.email}</p>
          <LogoutButton />
        </div>

        <section>
          <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-slate-400" /> Seus pedidos
          </h2>
          {pedidosList.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Nenhum pedido encontrado. Seus eSIMs aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidosList.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {STATUS_ICONS[p.status] ?? <Clock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{p.customerName}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(p.createdAt)} · {formatBrl(p.amountBrl)} ·{" "}
                        <span className="font-medium">{STATUS_LABELS[p.status] ?? p.status}</span>
                      </p>
                    </div>
                  </div>
                  <Link href={`/pedido/${p.publicId}`}
                    className="text-sm font-semibold text-primary hover:underline flex-shrink-0 ml-3">
                    Ver pedido
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
