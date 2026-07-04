export type MarginStatus = "green" | "yellow" | "red";

export function calculateCurrentMarginPercent(
  retailPriceBrl: number,
  wholesalePriceUsd: number,
  usdRate: number
): number {
  if (retailPriceBrl <= 0) return 0;
  const costBrl = wholesalePriceUsd * usdRate;
  return ((retailPriceBrl - costBrl) / retailPriceBrl) * 100;
}

export function getMarginStatus(
  currentMargin: number,
  minMarginPercent: number
): MarginStatus {
  if (currentMargin < minMarginPercent) return "red";
  if (currentMargin < minMarginPercent + 5) return "yellow";
  return "green";
}

/** Arredonda para cima até o próximo preço terminado em ,90 */
export function psychologicalPrice(raw: number): number {
  const base = Math.floor(raw);
  const with90 = base + 0.9;
  if (with90 >= raw) return Math.round(with90 * 100) / 100;
  return Math.round((base + 1 + 0.9) * 100) / 100;
}

export function priceForTargetMargin(
  wholesalePriceUsd: number,
  usdRate: number,
  targetMarginPercent: number
): number {
  const costBrl = wholesalePriceUsd * usdRate;
  const raw = costBrl / (1 - targetMarginPercent / 100);
  return psychologicalPrice(raw);
}

export function suggestReprice(
  retailPriceBrl: number,
  wholesalePriceUsd: number,
  usdRate: number,
  minMarginPercent: number
): number {
  const targetMargin = minMarginPercent + 5;
  return priceForTargetMargin(wholesalePriceUsd, usdRate, targetMargin);
}
