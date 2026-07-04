import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-ink text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo className="[&_span]:text-white [&_span:last-child]:text-slate-400" />
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              Chip de viagem (eSIM) com entrega imediata. Pagamento via Pix, suporte em português.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span className="rounded-full bg-slate-800 px-3 py-1">✓ Entrega imediata</span>
              <span className="rounded-full bg-slate-800 px-3 py-1">✓ Pagamento via Pix</span>
              <span className="rounded-full bg-slate-800 px-3 py-1">✓ Suporte em português</span>
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-white">Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/planos" className="hover:text-primary">Planos</Link></li>
              <li><Link href="/como-funciona" className="hover:text-primary">Como funciona</Link></li>
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link href="/suporte" className="hover:text-primary">Suporte</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/termos" className="hover:text-primary">Termos de uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-primary">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-700 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ChipViagem — Altivia CNPJ 63.101.423/0001-18</p>
        </div>
      </div>
    </footer>
  );
}
