/** In-person shopping — MV Luscious Lather at The Collective Boutique (Cinco Ranch). */

export const RETAIL_LOCATION = {
  hostName: "The Collective Boutique",
  hostArea: "Cinco Ranch",
  suite: "G9",
  streetAddress: "6729 S Fry Rd",
  city: "Katy",
  state: "TX",
  postalCode: "77494",
  country: "US",
  hoursLabel: "Open daily, 10am–8pm",
} as const;

export function formatRetailLocationTitle(): string {
  const { hostName, hostArea, suite } = RETAIL_LOCATION;
  return `${hostName} · ${hostArea} · ${suite}`;
}

export function formatRetailAddressSingleLine(): string {
  const { streetAddress, city, state, postalCode } = RETAIL_LOCATION;
  return `${streetAddress}, ${city}, ${state} ${postalCode}`;
}

export function retailLocationGoogleMapsUrl(): string {
  const query = encodeURIComponent(formatRetailAddressSingleLine());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
