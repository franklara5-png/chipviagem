import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "horizontal" | "icon";
  className?: string;
  /** Em fundo escuro o gradiente clareia e o texto inverte. */
  tone?: "light" | "dark";
}

export function Logo({ variant = "horizontal", className, tone = "light" }: LogoProps) {
  // id único por tom: dois <svg> na mesma página não podem repetir o id do gradiente.
  const gradientId = `cv-grad-${tone}`;
  const from = tone === "dark" ? "#FF8A8A" : "#FF6B6B";
  const to = tone === "dark" ? "#E36BC4" : "#C74B9E";
  const punch = tone === "dark" ? "#2B1B33" : "#FFFFFF";

  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-10 w-10", className)}
        role="img"
        aria-label="ChipViagem"
      >
        <defs>
          <linearGradient id={gradientId} x1="6" y1="40" x2="56" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        {/* Avião de papel; os quatro pontos na asa são os contatos do chip. */}
        <path d="M6 38 L54 8 L34 56 L27 38 Z" fill={`url(#${gradientId})`} />
        <path d="M27 38 L54 8" stroke={punch} strokeWidth="1.5" strokeOpacity="0.6" />
        <circle cx="34" cy="28" r="2" fill={punch} />
        <circle cx="41" cy="24" r="2" fill={punch} />
        <circle cx="34" cy="34" r="2" fill={punch} />
        <circle cx="41" cy="30" r="2" fill={punch} />
      </svg>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo variant="icon" tone={tone} className="h-9 w-9" />
      <span
        className={cn(
          "font-display text-xl font-bold leading-none tracking-tight",
          tone === "dark" ? "text-white" : "text-ink"
        )}
      >
        <span className={tone === "dark" ? "text-[#F090D0]" : "text-primary"}>Chip</span>
        Viagem
      </span>
    </div>
  );
}
