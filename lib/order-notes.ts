import type { ShippingAddress } from "@/lib/checkout";

export type OrderNotesMeta = {
  shippingAddress?: ShippingAddress;
  supabaseUserId?: string | null;
  paymentProvider?: string;
  trackingNumber?: string;
  carrier?: string;
  purchaseType?: "one_time" | "subscription";
  subscriptionCadence?: "monthly" | "bimonthly" | "quarterly";
  squareSubscriptionId?: string;
  squareCustomerId?: string;
  subscriptionStatus?: "active" | "pending_setup";
  /** Fulfillment note for warehouse (e.g. free sample). */
  fulfillmentNotes?: string;
  includeFreeSample?: boolean;
  promoCode?: string;
  promoDiscount?: number;
  /** Plain-text admin notes when stored separately from structured meta. */
  internalNotes?: string;
};

export function parseOrderNotes(notes: string | null | undefined): OrderNotesMeta {
  if (!notes?.trim()) return {};

  try {
    const parsed = JSON.parse(notes) as OrderNotesMeta;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    return { internalNotes: notes };
  }

  return { internalNotes: notes };
}

export function mergeOrderNotes(
  existing: string | null | undefined,
  patch: Partial<OrderNotesMeta>
): string {
  const current = parseOrderNotes(existing);
  const merged: OrderNotesMeta = { ...current, ...patch };
  return JSON.stringify(merged);
}

export function formatShippingAddressBlock(
  address: ShippingAddress,
  recipientName?: string
): string[] {
  const lines: string[] = [];
  if (recipientName?.trim()) {
    lines.push(recipientName.trim().toUpperCase());
  }
  lines.push(address.line1.toUpperCase());
  if (address.line2?.trim()) {
    lines.push(address.line2.trim().toUpperCase());
  }
  const countryCode =
    address.country === "US" || address.country.toLowerCase() === "united states"
      ? "US"
      : address.country.toUpperCase();
  lines.push(
    `${address.city.toUpperCase()}, ${address.state.toUpperCase()} ${address.postalCode} ${countryCode}`
  );
  return lines;
}
