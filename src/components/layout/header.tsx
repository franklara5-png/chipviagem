import Link from "next/link";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/UserMenu";
import { MobileNav } from "./mobile-nav";

const navLinks = [
  { href: "/planos", label: "Planos" },
  { href: "/quantos-gb-preciso", label: "Calculadora GB" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/blog", label: "Blog" },
  { href: "/suporte", label: "Suporte" },
];

export function Header() {
  return (
    <header className="glass-light sticky top-0 z-50 border-b border-ink/5 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="ChipViagem — Página inicial" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-semibold text-ink-soft transition-colors hover:text-primary after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-[image:var(--brand-gradient)] after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/planos"
            className="rounded-xl bg-[image:var(--brand-gradient)] px-4 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(199,75,158,0.30)] transition-transform hover:-translate-y-0.5 sm:px-5"
          >
            Ver planos
          </Link>
          <UserMenu />
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}
