"use client";

import { useEffect, useRef } from "react";

/**
 * Cartão eSIM em 3D real: faces separadas no eixo Z dentro de um contexto
 * preserve-3d. Gira sozinho e reage ao mouse. Sem WebGL — o custo de bundle
 * é o deste arquivo, e a home continua servida como HTML estático.
 */
export function Hero3DCard() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Quem pediu menos movimento no SO não recebe o parallax.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let frame = 0;

    function onPointerMove(event: PointerEvent) {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!stage) return;
        const { innerWidth, innerHeight } = window;
        const dx = (event.clientX / innerWidth - 0.5) * 2;
        const dy = (event.clientY / innerHeight - 0.5) * 2;
        stage.style.setProperty("--pointer-x", `${dx * 14}deg`);
        stage.style.setProperty("--pointer-y", `${-dy * 10}deg`);
      });
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="scene-3d relative mx-auto h-[300px] w-full max-w-[380px] md:h-[380px]"
      style={
        {
          "--pointer-x": "0deg",
          "--pointer-y": "0deg",
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {/* Halo atrás do objeto — dá o assentamento no espaço. */}
      <div className="animate-drift absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E36BC4] opacity-40 blur-[80px]" />

      <div
        className="layer-3d animate-float absolute inset-0 flex items-center justify-center"
        style={{
          transform: "rotateY(var(--pointer-x)) rotateX(var(--pointer-y))",
          transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="layer-3d animate-swing-y relative h-[210px] w-[330px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Face da frente */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl p-6 shadow-[0_32px_64px_rgba(43,27,51,0.45)]"
            style={{
              transform: "translateZ(14px)",
              background: "linear-gradient(135deg, #FF6B6B 0%, #C74B9E 100%)",
            }}
          >
            <div className="flex h-full flex-col justify-between text-white">
              <div className="flex items-start justify-between">
                <span className="font-display text-lg font-bold">eSIM</span>
                {/* Ondas de sinal */}
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12a10 10 0 0 1 14 0" opacity="0.55" />
                  <path d="M8 15a6 6 0 0 1 8 0" opacity="0.8" />
                  <circle cx="12" cy="18.5" r="1.2" fill="currentColor" stroke="none" />
                </svg>
              </div>

              {/* Contatos do chip */}
              <div className="grid w-16 grid-cols-2 gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="h-3.5 rounded-[3px] bg-white/85" />
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Conectado em
                </p>
                <p className="font-display text-2xl font-bold leading-tight">200+ destinos</p>
              </div>
            </div>
          </div>

          {/* Face de trás — QR, o que o cliente realmente recebe. */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl bg-[#3D2847] p-6 shadow-[0_32px_64px_rgba(43,27,51,0.45)]"
            style={{ transform: "rotateY(180deg) translateZ(14px)" }}
          >
            <div className="flex h-full items-center justify-between gap-5 text-white">
              <div className="grid grid-cols-5 gap-[3px]">
                {/* Padrão fixo: um QR "aleatório" mudaria a cada render. */}
                {QR_PATTERN.map((on, i) => (
                  <span
                    key={i}
                    className={`h-3 w-3 rounded-[2px] ${on ? "bg-white" : "bg-white/12"}`}
                  />
                ))}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                  Escaneie
                </p>
                <p className="font-display text-lg font-bold leading-tight">e já está online</p>
              </div>
            </div>
          </div>

          {/* Espessura do cartão: a borda que prova que é um sólido. */}
          <div
            className="absolute inset-0 rounded-2xl bg-[#8E2E70]"
            style={{ transform: "translateZ(-14px)" }}
          />
        </div>
      </div>
    </div>
  );
}

// 5x5 — desenho estável do QR decorativo.
const QR_PATTERN = [
  true, true, false, true, true,
  true, false, true, false, true,
  false, true, true, true, false,
  true, false, true, false, true,
  true, true, false, true, true,
];
