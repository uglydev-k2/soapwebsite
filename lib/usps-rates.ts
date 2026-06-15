/**
 * USPS Ground Advantage retail rates (Notice 123, Jan 2026).
 * Source: https://pe.usps.com — retail counter pricing by zone.
 */
export type UspsZone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** Ounce-tier retail prices [zone 1 … zone 9] */
const OUNCE_4: Record<UspsZone, number> = {
  1: 7.3, 2: 7.45, 3: 7.55, 4: 7.7, 5: 7.95, 6: 8.1, 7: 8.3, 8: 8.75, 9: 8.75,
};
const OUNCE_8: Record<UspsZone, number> = {
  1: 7.3, 2: 7.45, 3: 7.55, 4: 7.7, 5: 7.95, 6: 8.1, 7: 8.3, 8: 8.75, 9: 8.75,
};
const OUNCE_12: Record<UspsZone, number> = {
  1: 8.85, 2: 9.2, 3: 9.45, 4: 9.8, 5: 10.15, 6: 10.5, 7: 11.05, 8: 11.95, 9: 11.95,
};
const OUNCE_16: Record<UspsZone, number> = {
  1: 8.85, 2: 9.2, 3: 9.45, 4: 9.8, 5: 10.15, 6: 10.5, 7: 11.05, 8: 11.95, 9: 11.95,
};

/** Pound-tier retail prices (1–20 lb) by zone */
const POUND_RATES: Record<number, Record<UspsZone, number>> = {
  1: { 1: 8.85, 2: 9.2, 3: 9.45, 4: 9.8, 5: 10.15, 6: 10.5, 7: 11.05, 8: 11.95, 9: 11.95 },
  2: { 1: 10.0, 2: 10.65, 3: 11.3, 4: 12.05, 5: 13.05, 6: 14.0, 7: 15.25, 8: 17.65, 9: 17.65 },
  3: { 1: 10.45, 2: 11.1, 3: 11.7, 4: 12.7, 5: 13.85, 6: 15.25, 7: 17.55, 8: 20.75, 9: 20.75 },
  4: { 1: 11.35, 2: 11.8, 3: 12.65, 4: 13.75, 5: 15.2, 6: 16.95, 7: 19.35, 8: 22.45, 9: 22.45 },
  5: { 1: 12.0, 2: 12.55, 3: 13.45, 4: 14.65, 5: 16.15, 6: 18.15, 7: 20.75, 8: 24.1, 9: 24.1 },
  6: { 1: 12.5, 2: 12.85, 3: 13.75, 4: 15.15, 5: 17.05, 6: 19.5, 7: 22.55, 8: 26.25, 9: 26.25 },
  7: { 1: 12.95, 2: 13.35, 3: 14.25, 4: 15.85, 5: 18.0, 6: 20.9, 7: 24.3, 8: 28.35, 9: 28.35 },
  8: { 1: 13.5, 2: 13.75, 3: 14.65, 4: 16.35, 5: 18.9, 6: 22.3, 7: 26.35, 8: 30.7, 9: 30.7 },
  9: { 1: 14.0, 2: 14.25, 3: 15.05, 4: 16.95, 5: 19.8, 6: 23.65, 7: 28.45, 8: 33.05, 9: 33.05 },
  10: { 1: 14.75, 2: 15.1, 3: 15.95, 4: 17.95, 5: 21.15, 6: 25.45, 7: 30.85, 8: 36.55, 9: 36.55 },
};

function clampZone(zone: number): UspsZone {
  return Math.min(9, Math.max(1, zone)) as UspsZone;
}

export function getGroundAdvantageRetailRate(
  billingOz: number,
  billingLb: number,
  zone: number
): number {
  const z = clampZone(zone);

  if (billingOz <= 4) return OUNCE_4[z];
  if (billingOz <= 8) return OUNCE_8[z];
  if (billingOz <= 12) return OUNCE_12[z];
  if (billingOz <= 15.999) return OUNCE_16[z];

  const lb = Math.min(10, Math.max(1, billingLb));
  return POUND_RATES[lb]?.[z] ?? POUND_RATES[10][z];
}

/** First-Class Package International — retail estimates (2026). */
export type IntlRegion = "canada" | "mexico" | "europe" | "asia_pacific" | "other";

export function getInternationalRegion(countryCode: string): IntlRegion {
  const code = countryCode.toUpperCase();
  if (code === "CA") return "canada";
  if (code === "MX") return "mexico";
  if (
    [
      "GB", "FR", "DE", "IT", "ES", "NL", "BE", "IE", "PT", "SE", "NO", "DK",
      "FI", "CH", "AT", "PL", "GR",
    ].includes(code)
  ) {
    return "europe";
  }
  if (["AU", "NZ", "JP", "KR", "SG", "HK", "TW"].includes(code)) {
    return "asia_pacific";
  }
  return "other";
}

/** Intl retail estimates by region and billed ounces (USPS FCPI). */
const INTL_RATES: Record<IntlRegion, { maxOz: number; price: number }[]> = {
  canada: [
    { maxOz: 8, price: 16.95 },
    { maxOz: 12, price: 19.5 },
    { maxOz: 16, price: 22.75 },
    { maxOz: 32, price: 28.5 },
    { maxOz: 48, price: 36.0 },
  ],
  mexico: [
    { maxOz: 8, price: 18.5 },
    { maxOz: 12, price: 21.25 },
    { maxOz: 16, price: 24.5 },
    { maxOz: 32, price: 31.0 },
    { maxOz: 48, price: 39.5 },
  ],
  europe: [
    { maxOz: 8, price: 19.75 },
    { maxOz: 12, price: 23.5 },
    { maxOz: 16, price: 27.25 },
    { maxOz: 32, price: 35.75 },
    { maxOz: 48, price: 46.0 },
  ],
  asia_pacific: [
    { maxOz: 8, price: 21.5 },
    { maxOz: 12, price: 25.75 },
    { maxOz: 16, price: 30.0 },
    { maxOz: 32, price: 39.5 },
    { maxOz: 48, price: 51.0 },
  ],
  other: [
    { maxOz: 8, price: 22.75 },
    { maxOz: 12, price: 27.0 },
    { maxOz: 16, price: 31.5 },
    { maxOz: 32, price: 42.0 },
    { maxOz: 48, price: 54.5 },
  ],
};

export function getInternationalRetailRate(
  region: IntlRegion,
  totalOz: number
): number {
  const tiers = INTL_RATES[region];
  const tier = tiers.find((t) => totalOz <= t.maxOz) ?? tiers[tiers.length - 1];
  return tier.price;
}
