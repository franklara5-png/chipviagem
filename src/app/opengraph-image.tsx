import { ImageResponse } from "next/og";
import { brandMarkDataUri } from "@/lib/brand-mark";

// Sem numero de cobertura de proposito: o catalogo ainda nao existe e o
// numero real depende do provedor de eSIM. A versao anterior dizia "100+
// paises" enquanto a home dizia "200+ destinos".
export const alt = "ChipViagem — chip de viagem (eSIM): desembarque já conectado";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#2B1B33",
          backgroundImage:
            "radial-gradient(circle at 88% 12%, rgba(227,107,196,0.38), rgba(43,27,51,0) 55%), radial-gradient(circle at 8% 95%, rgba(255,107,107,0.30), rgba(43,27,51,0) 50%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brandMarkDataUri()} width={88} height={88} alt="" />
          <div style={{ display: "flex", fontSize: 46, fontWeight: 700 }}>
            <span style={{ color: "#F090D0" }}>Chip</span>
            <span>Viagem</span>
          </div>
        </div>

        <div
          style={{ display: "flex", fontSize: 88, fontWeight: 700, lineHeight: 1.05, marginTop: 52 }}
        >
          Desembarque já conectado.
        </div>

        <div style={{ display: "flex", fontSize: 36, marginTop: 30, color: "rgba(255,255,255,0.72)" }}>
          Chip de viagem (eSIM) · Pix · suporte em português
        </div>
      </div>
    ),
    size,
  );
}
