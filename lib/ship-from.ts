export type ShipFromAddress = {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
};

export type ShipParcelDefaults = {
  lengthIn: number;
  widthIn: number;
  heightIn: number;
};

function readEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

export function isShippoConfigured(): boolean {
  return Boolean(readEnv("SHIPPO_API_TOKEN"));
}

export function getShipFromAddress(): ShipFromAddress | null {
  const street1 = readEnv("SHIP_FROM_STREET1");
  const city = readEnv("SHIP_FROM_CITY");
  const state = readEnv("SHIP_FROM_STATE");
  const zip = readEnv("SHIP_FROM_ZIP");

  if (!street1 || !city || !state || !zip) {
    return null;
  }

  return {
    name: readEnv("SHIP_FROM_NAME") ?? "MV Luscious Lather",
    street1,
    street2: readEnv("SHIP_FROM_STREET2"),
    city,
    state: state.toUpperCase(),
    zip,
    country: "US",
    phone: readEnv("SHIP_FROM_PHONE"),
    email: readEnv("SHIP_FROM_EMAIL") ?? readEnv("RESEND_FROM_EMAIL"),
  };
}

export function getDefaultParcel(): ShipParcelDefaults {
  const lengthIn = Number(readEnv("SHIP_PARCEL_LENGTH_IN") ?? "8");
  const widthIn = Number(readEnv("SHIP_PARCEL_WIDTH_IN") ?? "6");
  const heightIn = Number(readEnv("SHIP_PARCEL_HEIGHT_IN") ?? "3");

  return {
    lengthIn: Number.isFinite(lengthIn) && lengthIn > 0 ? lengthIn : 8,
    widthIn: Number.isFinite(widthIn) && widthIn > 0 ? widthIn : 6,
    heightIn: Number.isFinite(heightIn) && heightIn > 0 ? heightIn : 3,
  };
}
