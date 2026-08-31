import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { getSeoMetadata } from "@/lib/seo";

export const metadata = getSeoMetadata({ title: "Entrar", path: "/login", noIndex: true });

export default function LoginPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Entrar no ChipViagem</h1>
          <p className="text-ink-soft text-sm">Use sua conta Google para acessar seus pedidos</p>
        </div>
        <GoogleLoginButton />
        <p className="text-xs text-center text-slate-400">
          Ao entrar, você concorda com os{" "}
          <a href="/termos" className="underline hover:text-ink-soft">Termos de Uso</a>{" "}
          e a <a href="/privacidade" className="underline hover:text-ink-soft">Política de Privacidade</a>.
        </p>
      </div>
    </main>
  );
}
