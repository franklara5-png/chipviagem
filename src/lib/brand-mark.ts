// Aviao de papel da marca como SVG em string, para as imagens geradas por
// next/og (favicon, apple-icon, imagem OG), que nao renderizam o componente
// <Logo>. Mesmo desenho de src/components/logo.tsx, no tom de fundo escuro.
export function brandMarkDataUri({
  background,
  rounded = true,
}: { background?: string; rounded?: boolean } = {}) {
  const bg = background
    ? `<rect width="64" height="64"${rounded ? ' rx="14"' : ""} fill="${background}"/>`
    : "";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${bg}` +
    `<defs><linearGradient id="g" x1="6" y1="40" x2="56" y2="10" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="#FF8A8A"/><stop offset="1" stop-color="#E36BC4"/>` +
    `</linearGradient></defs>` +
    `<g transform="translate(6.2 4.5) scale(0.86)">` +
    `<path d="M6 38 L54 8 L34 56 L27 38 Z" fill="url(#g)"/>` +
    `<path d="M27 38 L54 8" stroke="#2B1B33" stroke-width="1.5" stroke-opacity="0.6"/>` +
    `<circle cx="34" cy="28" r="2" fill="#2B1B33"/><circle cx="41" cy="24" r="2" fill="#2B1B33"/>` +
    `<circle cx="34" cy="34" r="2" fill="#2B1B33"/><circle cx="41" cy="30" r="2" fill="#2B1B33"/>` +
    `</g></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
