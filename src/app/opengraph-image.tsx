import { ImageResponse } from "next/og";

export const alt = "ChipViagem — chip de viagem (eSIM) com entrega imediata";
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
          background: "linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, opacity: 0.9 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#F97316",
              fontWeight: 700,
            }}
          >
            CV
          </div>
          <div style={{ fontWeight: 600 }}>ChipViagem</div>
        </div>

        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.1, marginTop: 40 }}>
          Chip de viagem (eSIM) com entrega imediata
        </div>

        <div style={{ display: "flex", fontSize: 34, marginTop: 32, opacity: 0.92 }}>
          Pix · 100+ países · suporte em português
        </div>
      </div>
    ),
    size,
  );
}
