/**
 * USPS domestic zones from Texas (MsVee ships from TX).
 * Zone 2 = in-state; higher zones = farther destinations.
 * Based on USPS Ground Advantage zone charts for Texas origin.
 */
const STATE_ZONE_FROM_TX: Record<string, number> = {
  TX: 2,
  OK: 3,
  LA: 3,
  NM: 3,
  AR: 3,
  AZ: 4,
  CO: 4,
  KS: 4,
  NE: 4,
  MS: 4,
  AL: 4,
  TN: 4,
  MO: 5,
  IA: 5,
  MN: 5,
  WI: 5,
  IL: 5,
  IN: 5,
  GA: 5,
  FL: 5,
  SC: 5,
  NC: 5,
  KY: 6,
  OH: 6,
  MI: 6,
  PA: 6,
  NY: 6,
  NJ: 6,
  DC: 6,
  MD: 6,
  DE: 6,
  VA: 6,
  WV: 6,
  CA: 7,
  OR: 7,
  WA: 7,
  NV: 7,
  UT: 7,
  ID: 7,
  MT: 7,
  WY: 7,
  ND: 7,
  SD: 7,
  ME: 8,
  NH: 8,
  VT: 8,
  MA: 8,
  RI: 8,
  CT: 8,
  HI: 8,
  AK: 8,
};

export function getUspsZoneFromTexas(stateCode: string): number {
  const code = stateCode.trim().toUpperCase();
  return STATE_ZONE_FROM_TX[code] ?? 6;
}

export function isTexas(stateCode: string): boolean {
  return stateCode.trim().toUpperCase() === "TX";
}
