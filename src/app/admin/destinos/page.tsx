import { db } from "@/db";
import { destinations } from "@/db/schema";
import { asc } from "drizzle-orm";
import {
  createDestinationAction,
  updateDestinationAction,
  deleteDestinationFormAction,
} from "./actions";

export default async function DestinosPage() {
  const allDestinations = await db.select().from(destinations).orderBy(asc(destinations.name));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Destinos</h1>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-medium text-slate-600">Novo destino</h2>
        <form action={createDestinationAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            name="name"
            placeholder="Nome"
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="countryCode"
            placeholder="Código país (ex: JP)"
            required
            maxLength={10}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm uppercase"
          />
          <input
            name="region"
            placeholder="Região"
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="flagEmoji"
            placeholder="Emoji (ex: 🇯🇵)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="heroText"
            placeholder="Texto hero"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Criar destino
          </button>
        </form>
      </section>

      <div className="space-y-4">
        {allDestinations.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum destino cadastrado</p>
        ) : (
          allDestinations.map((dest) => (
            <div key={dest.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <form action={updateDestinationAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <input type="hidden" name="id" value={dest.id} />
                <input
                  name="name"
                  defaultValue={dest.name}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  name="countryCode"
                  defaultValue={dest.countryCode}
                  required
                  maxLength={10}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm uppercase"
                />
                <input
                  name="region"
                  defaultValue={dest.region}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  name="flagEmoji"
                  defaultValue={dest.flagEmoji}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  name="heroText"
                  defaultValue={dest.heroText}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isActive" defaultChecked={dest.isActive} />
                  Ativo
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
                  >
                    Salvar
                  </button>
                </div>
              </form>
              <form action={deleteDestinationFormAction} className="mt-2">
                <input type="hidden" name="id" value={dest.id} />
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:underline"
                >
                  Excluir
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
