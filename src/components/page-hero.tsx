import Link from "next/link";

interface PageHeroProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Selos curtos de reforço, sem o "✓" — o componente desenha o ícone. */
  badges?: string[];
  cta?: { href: string; label: string };
  /** Páginas de destino usam a versão compacta. */
  size?: "default" | "compact";
  children?: React.ReactNode;
}

export function PageHero({
  title,
  subtitle,
  badges,
  cta,
  size = "default",
  children,
}: PageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden bg-deep px-4 text-white ${
        size === "compact" ? "py-14" : "py-16 md:py-24"
      }`}
    >
      <div className="grid-floor pointer-events-none absolute inset-x-0 bottom-0 h-56 opacity-60" />
      <div className="animate-drift pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent opacity-20 blur-[110px]" />
      <div
        className="animate-drift pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-primary opacity-25 blur-[120px]"
        style={{ animationDelay: "-8s" }}
      />

      <div className="animate-rise relative mx-auto max-w-4xl text-center">
        <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65 md:text-xl">{subtitle}</p>
        )}

        {badges && badges.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2.5 text-sm">
            {badges.map((badge) => (
              <span
                key={badge}
                className="glass backdrop-blur-xl backdrop-saturate-150 flex items-center gap-1.5 rounded-full px-4 py-2 font-semibold text-white/85"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-accent" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                {badge}
              </span>
            ))}
          </div>
        )}

        {cta && (
          <Link
            href={cta.href}
            className="mt-8 inline-block rounded-xl bg-[image:var(--brand-gradient)] px-8 py-4 text-lg font-bold text-white shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
          >
            {cta.label}
          </Link>
        )}

        {children}
      </div>
    </section>
  );
}
