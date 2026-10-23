import type { ShippingAddress } from "@/lib/checkout";
import { isUsCountry } from "@/lib/shipping";
import type { ShipFromAddress, ShipParcelDefaults } from "@/lib/ship-from";

const SHIPPO_API_BASE = "https://api.goshippo.com";

type ShippoAddress = {
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

type ShippoRate = {
  object_id: string;
  provider: string;
  servicelevel: { token: string; name: string };
  amount: string;
  currency: string;
};

type ShippoShipment = {
  object_id: string;
  rates: ShippoRate[];
  status: string;
  messages?: { text: string }[];
};

type ShippoTransaction = {
  object_id: string;
  status: string;
  tracking_number?: string;
  label_url?: string;
  rate?: ShippoRate;
  messages?: { text: string }[];
};

export type CreateShippingLabelInput = {
  shipFrom: ShipFromAddress;
  shipTo: ShippingAddress;
  recipientName: string;
  weightOz: number;
  parcel: ShipParcelDefaults;
  orderNumber: string;
};

export type CreateShippingLabelResult = {
  transactionId: string;
  trackingNumber: string;
  labelUrl: string;
  carrier: string;
  service: string;
  rateAmount: number;
  weightOz: number;
};

export class ShippoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShippoError";
  }
}

function getShippoToken(): string {
  const token = process.env.SHIPPO_API_TOKEN?.trim();
  if (!token) {
    throw new ShippoError(
      "Shipping labels are not configured. Add SHIPPO_API_TOKEN and ship-from address env vars."
    );
  }
  return token;
}

async function shippoFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${SHIPPO_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `ShippoToken ${getShippoToken()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    detail?: string;
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    const detail =
      (data as { detail?: string }).detail ??
      (data as { error?: string }).error ??
      (data as { message?: string }).message ??
      `Shippo request failed (${response.status})`;
    throw new ShippoError(detail);
  }

  return data;
}

function toShipFromAddress(address: ShipFromAddress): ShippoAddress {
  return {
    name: address.name,
    street1: address.street1,
    street2: address.street2,
    city: address.city,
    state: address.state,
    zip: address.zip,
    country: address.country,
    phone: address.phone,
    email: address.email,
  };
}

function toShipToAddress(
  address: ShippingAddress,
  name: string
): ShippoAddress {
  return {
    name,
    street1: address.line1,
    street2: address.line2?.trim() || undefined,
    city: address.city,
    state: address.state,
    zip: address.postalCode,
    country: isUsCountry(address.country) ? "US" : address.country.toUpperCase(),
  };
}

function pickGroundAdvantageRate(rates: ShippoRate[]): ShippoRate | null {
  const uspsRates = rates.filter((rate) => rate.provider.toLowerCase() === "usps");
  if (!uspsRates.length) return null;

  const preferredTokens = [
    "usps_ground_advantage",
    "usps_parcel_select",
    "usps_priority",
    "usps_first",
  ];

  for (const token of preferredTokens) {
    const match = uspsRates.find((rate) => rate.servicelevel.token === token);
    if (match) return match;
  }

  return uspsRates.sort((a, b) => Number(a.amount) - Number(b.amount))[0] ?? null;
}

export function assertDomesticShipping(address: ShippingAddress): void {
  if (!isUsCountry(address.country)) {
    throw new ShippoError(
      "In-app label printing is currently available for US orders only."
    );
  }
}

export async function createShippingLabel(
  input: CreateShippingLabelInput
): Promise<CreateShippingLabelResult> {
  assertDomesticShipping(input.shipTo);

  const shipment = await shippoFetch<ShippoShipment>("/shipments/", {
    method: "POST",
    body: JSON.stringify({
      address_from: toShipFromAddress(input.shipFrom),
      address_to: toShipToAddress(input.shipTo, input.recipientName),
      parcels: [
        {
          length: String(input.parcel.lengthIn),
          width: String(input.parcel.widthIn),
          height: String(input.parcel.heightIn),
          distance_unit: "in",
          weight: String(Math.max(input.weightOz, 1)),
          mass_unit: "oz",
        },
      ],
      extra: {
        reference_1: input.orderNumber,
      },
      async: false,
    }),
  });

  if (shipment.status === "ERROR") {
    const message =
      shipment.messages?.map((entry) => entry.text).join("; ") ||
      "Shippo could not rate this shipment.";
    throw new ShippoError(message);
  }

  const rate = pickGroundAdvantageRate(shipment.rates ?? []);
  if (!rate) {
    throw new ShippoError("No USPS shipping rates were returned for this order.");
  }

  const transaction = await shippoFetch<ShippoTransaction>("/transactions/", {
    method: "POST",
    body: JSON.stringify({
      rate: rate.object_id,
      label_file_type: "PDF",
      async: false,
    }),
  });

  if (transaction.status !== "SUCCESS" || !transaction.label_url || !transaction.tracking_number) {
    const message =
      transaction.messages?.map((entry) => entry.text).join("; ") ||
      "Shippo could not create a shipping label.";
    throw new ShippoError(message);
  }

  return {
    transactionId: transaction.object_id,
    trackingNumber: transaction.tracking_number,
    labelUrl: transaction.label_url,
    carrier: rate.provider.toUpperCase(),
    service: rate.servicelevel.name,
    rateAmount: Number(rate.amount),
    weightOz: input.weightOz,
  };
}
