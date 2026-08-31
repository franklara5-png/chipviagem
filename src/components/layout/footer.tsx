import Link from "next/link";
import { Logo } from "@/components/logo";

const columns = [
  {
    title: "Links",
    links: [
      { href: "/planos", label: "Planos" },
      { href: "/como-funciona", label: "Como funciona" },
      { href: "/blog", label: "Blog" },
      { href: "/suporte", label: "Suporte" },
    ],
  },
  {
    title: "Guias",
    links: [
      { href: "/chip-internacional", label: "Chip internacional" },
      { href: "/comparativo-chip-viagem", label: "Comparativo" },
      { href: "/quantos-gb-preciso", label: "Quantos GB preciso" },
      { href: "/esim-brasil", label: "eSIM no Brasil" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/termos", label: "Termos de uso" },
      { href: "/privacidade", label: "Privacidade" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-deep text-white/70">
      {/* Brilho da marca sangrando do topo. */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[680px] -translate-x-1/2 rounded-full opacity-25 blur-[100px]"
        style={{ background: "var(--brand-gradient)" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo tone="dark" />
            <p className="mt-4 max-w-sm text-sm text-white/55">
              Chip de viagem (eSIM) com entrega imediata. Pagamento via Pix, suporte em
              português.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              {["Entrega imediata", "Pagamento via Pix", "Suporte em português"].map((item) => (
                <span key={item} className="glass backdrop-blur-xl backdrop-saturate-150 rounded-full px-3 py-1.5 text-white/80">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-display mb-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white/45">
                {column.title}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/65 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/35">
          <p>© {new Date().getFullYear()} ChipViagem — Altivia CNPJ 63.101.423/0001-18</p>
        </div>
      </div>
    </footer>
  );
}
