import { db } from "@/db";
import { webhookEvents } from "@/db/schema";
import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function WebhooksPage() {
  const events = await db
    .select()
    .from(webhookEvents)
    .orderBy(desc(webhookEvents.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Webhooks</h1>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Event ID</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Processado</th>
              <th className="px-4 py-3">Erro</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Nenhum evento registrado
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{event.eventId}</td>
                  <td className="px-4 py-3">{event.eventType}</td>
                  <td className="px-4 py-3">
                    {event.processedAt ? (
                      <span className="text-green-600">Sim</span>
                    ) : (
                      <span className="text-slate-400">Não</span>
                    )}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-red-600">
                    {event.error ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {format(event.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
