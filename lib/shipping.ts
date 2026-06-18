/** Shared shipping constants for cart, checkout, and marketing copy */
export const US_COUNTRY = "United States";
export const US_COUNTRY_CODE = "US";
export const FLAT_SHIPPING_RATE = 8;
export const TAX_RATE = 0.08;

/** Countries available at checkout (ISO 3166-1 alpha-2). */
export const SHIPPING_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IE", name: "Ireland" },
  { code: "NL", name: "Netherlands" },
  { code: "JP", name: "Japan" },
  { code: "NZ", name: "New Zealand" },
  { code: "SG", name: "Singapore" },
] as const;

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const;

export function isUsCountry(country: string): boolean {
  const trimmed = country.trim();
  const normalized = trimmed.toLowerCase();
  return (
    normalized === "united states" ||
    normalized === "us" ||
    normalized === "usa" ||
    trimmed.toUpperCase() === "US"
  );
}

export function getCountryCode(country: string): string {
  if (isUsCountry(country)) return "US";
  const match = SHIPPING_COUNTRIES.find(
    (c) => c.code === country.toUpperCase() || c.name.toLowerCase() === country.toLowerCase()
  );
  return match?.code ?? country.toUpperCase();
}

export function calculateCartTotals(subtotal: number, shipping?: number) {
  const shippingCost = shipping ?? FLAT_SHIPPING_RATE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;
  return { subtotal, shipping: shippingCost, tax, total };
}
