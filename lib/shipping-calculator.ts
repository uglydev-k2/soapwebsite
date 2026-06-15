import type { Category } from "@prisma/client";
import { getBundleLineTotal } from "@/lib/bundle-pricing";
import {
  calculateCartWeightOz,
  toUspsBillingWeightOz,
  type CartWeightItem,
} from "@/lib/product-weight";
import {
  getGroundAdvantageRetailRate,
  getInternationalRegion,
  getInternationalRetailRate,
} from "@/lib/usps-rates";
import { getUspsZoneFromTexas, isTexas } from "@/lib/usps-zones";
import { isUsCountry, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { getCountryCode } from "@/lib/shipping";

export type ShippingQuoteItem = {
  productId: string;
  quantity: number;
  price: number;
  category?: Category;
  name?: string;
  slug?: string;
  weightOz?: number | null;
};

export type ShippingQuoteInput = {
  items: ShippingQuoteItem[];
  country: string;
  state?: string;
  postalCode?: string;
  subtotal?: number;
};

export type ShippingQuote = {
  shipping: number;
  method: string;
  weightOz: number;
  billingTier: string;
  zone: number | null;
  inTexas: boolean;
  international: boolean;
  freeShippingApplied: boolean;
};

export function calculateShippingQuote(input: ShippingQuoteInput): ShippingQuote {
  const weightItems: CartWeightItem[] = input.items.map((item) => ({
    category: item.category ?? "BAR_SOAP",
    name: item.name ?? "",
    slug: item.slug ?? "",
    quantity: item.quantity,
    weightOz: item.weightOz,
  }));

  const weightOz = calculateCartWeightOz(weightItems);
  const { billingOz, billingLb, tier } = toUspsBillingWeightOz(weightOz);

  const subtotal =
    input.subtotal ??
    input.items.reduce(
      (sum, item) => sum + getBundleLineTotal(item.price, item.quantity),
      0
    );

  const countryCode = getCountryCode(input.country);
  const domestic = isUsCountry(countryCode);

  if (!domestic) {
    const region = getInternationalRegion(countryCode);
    const shipping = getInternationalRetailRate(region, weightOz);
    return {
      shipping: Math.round(shipping * 100) / 100,
      method: "USPS First-Class Package International",
      weightOz: Math.round(weightOz * 10) / 10,
      billingTier: tier,
      zone: null,
      inTexas: false,
      international: true,
      freeShippingApplied: false,
    };
  }

  const state = input.state?.trim().toUpperCase() ?? "";
  const zone = getUspsZoneFromTexas(state || "TX");
  let shipping = getGroundAdvantageRetailRate(billingOz, billingLb, zone);

  const inTexas = isTexas(state);
  const freeShippingApplied = subtotal >= FREE_SHIPPING_THRESHOLD;

  if (freeShippingApplied) {
    shipping = 0;
  }

  return {
    shipping: Math.round(shipping * 100) / 100,
    method: inTexas
      ? "USPS Ground Advantage (Texas)"
      : "USPS Ground Advantage",
    weightOz: Math.round(weightOz * 10) / 10,
    billingTier: tier,
    zone,
    inTexas,
    international: false,
    freeShippingApplied,
  };
}
