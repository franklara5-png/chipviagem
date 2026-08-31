import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { getSeoMetadata } from "@/lib/seo";

export const metadata = getSeoMetadata({ title: "Página não encontrada", noIndex: true });

const atalhos = [
  { href: "/planos", label: "Ver planos", desc: "Escolha o eSIM do seu destino" },
  { href: "/quantos-gb-preciso", label: "Quantos GB preciso", desc: "Calculadora de dados para a viagem" },
  { href: "/como-funciona", label: "Como funciona", desc: "Comprar e instalar em 3 passos" },
  { href: "/blog", label: "Blog", desc: "Guias de viagem e eSIM" },
  { href: "/comparativo-chip-viagem", label: "Comparativo", desc: "eSIM, chip físico ou roaming" },
  { href: "/suporte", label: "Suporte", desc: "Falar com a gente em português" },
];

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm font-semibold text-primary">Erro 404</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Não encontramos essa página</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-soft">
          O link pode estar quebrado ou a página pode ter mudado de endereço. Veja por onde seguir:
        </p>

        <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
          {atalhos.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-xl border border-ink/8 bg-surface-raised p-4 transition hover:border-primary hover:shadow-sm"
            >
              <span className="block font-semibold text-ink">{a.label}</span>
              <span className="mt-1 block text-sm text-ink-soft">{a.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
