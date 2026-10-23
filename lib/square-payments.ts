import { getCountryCode } from "@/lib/shipping";
import { getSquareClient, getSquareLocationId } from "@/lib/square";

export async function chargeSquarePayment(input: {
  sourceId: string;
  idempotencyKey: string;
  amountCents: bigint;
  orderNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  /** Required when `sourceId` is a Square card-on-file id (`ccof:…`). */
  customerId?: string;
}) {
  const isCardOnFile = input.sourceId.startsWith("ccof:");
  if (isCardOnFile && !input.customerId?.trim()) {
    throw new Error(
      "Square customerId is required when charging a saved card (ccof)"
    );
  }

  return getSquareClient().payments.create({
    sourceId: input.sourceId,
    idempotencyKey: input.idempotencyKey,
    customerId: input.customerId?.trim() || undefined,
    amountMoney: {
      amount: input.amountCents,
      currency: "USD",
    },
    locationId: getSquareLocationId(),
    referenceId: input.orderNumber.slice(0, 40),
    note: `mvlusciouslather order ${input.orderNumber}`,
    buyerEmailAddress: input.email,
    shippingAddress: {
      addressLine1: input.line1,
      addressLine2: input.line2,
      locality: input.city,
      administrativeDistrictLevel1: input.state ?? undefined,
      postalCode: input.postalCode,
      country: getCountryCode(input.country) as
        | "US"
        | "CA"
        | "MX"
        | "GB"
        | "AU"
        | "DE"
        | "FR"
        | "IE"
        | "NL"
        | "JP"
        | "NZ"
        | "SG",
      firstName: input.firstName,
      lastName: input.lastName,
    },
    autocomplete: true,
  });
}

export const SQUARE_PAYMENT_SUCCESS_STATUSES = new Set([
  "COMPLETED",
  "APPROVED",
  "PENDING",
]);
