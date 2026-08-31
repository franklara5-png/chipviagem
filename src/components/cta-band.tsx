import Link from "next/link";

interface CtaBandProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  href: string;
  label: string;
}

export function CtaBand({ title, subtitle, href, label }: CtaBandProps) {
  return (
    <section className="relative overflow-hidden bg-deep px-4 py-20 text-white">
      <div
        className="animate-drift pointer-events-none absolute left-1/2 top-1/2 h-72 w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[110px]"
        style={{ background: "var(--brand-gradient)" }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-5 text-lg text-white/60">{subtitle}</p>}
        <Link
          href={href}
          className="mt-8 inline-block rounded-xl bg-[image:var(--brand-gradient)] px-8 py-4 text-lg font-bold text-white shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}
