import { ImageResponse } from "next/og";
import { brandMarkDataUri } from "@/lib/brand-mark";

// Icone de atalho no iPhone. Fundo sem cantos: o iOS aplica a propria mascara.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brandMarkDataUri({ background: "#2B1B33", rounded: false })}
        width={size.width}
        height={size.height}
        alt=""
      />
    ),
    size,
  );
}
