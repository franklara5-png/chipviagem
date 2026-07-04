import Link from "next/link";
import { Logo } from "@/components/logo";

const navLinks = [
  { href: "/planos", label: "Planos" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/blog", label: "Blog" },
  { href: "/suporte", label: "Suporte" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="ChipViagem — Página inicial">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/planos"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Ver planos
        </Link>
      </div>
    </header>
  );
}
