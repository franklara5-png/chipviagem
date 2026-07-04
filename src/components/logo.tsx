import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "horizontal" | "icon";
  className?: string;
}

export function Logo({ variant = "horizontal", className }: LogoProps) {
  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-10 w-10", className)}
        aria-label="ChipViagem"
      >
        <rect x="4" y="4" width="40" height="40" rx="8" fill="#0EA5E9" />
        <rect x="10" y="10" width="28" height="28" rx="4" fill="#0369A1" />
        <circle cx="14" cy="14" r="2" fill="#F97316" />
        <circle cx="34" cy="14" r="2" fill="#F97316" />
        <circle cx="14" cy="34" r="2" fill="#F97316" />
        <circle cx="34" cy="34" r="2" fill="#F97316" />
        <path
          d="M24 18 L30 24 L24 30 L18 24 Z"
          fill="white"
          opacity="0.9"
        />
        <path
          d="M30 24 Q36 20 40 16"
          stroke="#F97316"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="40" cy="16" r="3" fill="#F97316" />
      </svg>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Logo variant="icon" className="h-9 w-9" />
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-bold text-ink">ChipViagem</span>
        <span className="text-[10px] text-primary-dark hidden sm:block">
          Conectado em qualquer lugar do mundo.
        </span>
      </div>
    </div>
  );
}
