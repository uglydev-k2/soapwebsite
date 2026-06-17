import type { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import { calculateShippingQuote } from "@/lib/shipping-calculator";
import { getCountryCode } from "@/lib/shipping";
import { pickProductImage } from "@/lib/email-templates";
import { getCategoryLabel } from "@/lib/utils";

const TAX_RATE = 0.08;

export type CheckoutSettings = {
  flatShippingRate: number;
  freeShippingThreshold: number;
  featureCheckout: boolean;
  taxRate: number;
};

const DEFAULT_CHECKOUT_SETTINGS: CheckoutSettings = {
  flatShippingRate: 8,
  freeShippingThreshold: 60,
  featureCheckout: true,
  taxRate: TAX_RATE,
};

export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  if (!isDatabaseConfigured()) return DEFAULT_CHECKOUT_SETTINGS;

  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });
    if (!settings) return DEFAULT_CHECKOUT_SETTINGS;
    return {
      flatShippingRate: settings.flatShippingRate,
      freeShippingThreshold: settings.freeShippingThreshold,
      featureCheckout: settings.featureCheckout,
      taxRate: TAX_RATE,
    };
  } catch {
    return DEFAULT_CHECKOUT_SETTINGS;
  }
}

export function calculateOrderTotals(
  subtotal: number,
  settings: CheckoutSettings,
  shippingOverride?: number
) {
  const shipping =
    shippingOverride ??
    (subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingRate);
  const tax = Math.round(subtotal * settings.taxRate * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  return { subtotal, shipping, tax, total };
}

export async function calculateCheckoutShipping(
  items: ValidatedCartItem[],
  address: Pick<ShippingAddress, "country" | "state" | "postalCode">,
  subtotal: number
) {
  const settings = await getCheckoutSettings();
  const products = await Promise.all(
    items.map(async (item) => {
      if (!isDatabaseConfigured()) {
        return { item, category: "BAR_SOAP" as Category, weightOz: null };
      }
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { category: true, weightOz: true },
      });
      return {
        item,
        category: product?.category ?? ("BAR_SOAP" as Category),
        weightOz: product?.weightOz ?? null,
      };
    })
  );

  return calculateShippingQuote({
    items: products.map(({ item, category, weightOz }) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      category,
      name: item.name,
      slug: item.slug,
      weightOz,
    })),
    country: getCountryCode(address.country),
    state: address.state,
    postalCode: address.postalCode,
    subtotal,
    freeShippingThreshold: settings.freeShippingThreshold,
  });
}

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type ValidatedCartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image?: string;
  fragrance?: string | null;
  categoryLabel?: string;
};

export async function validateCartItems(
  items: { productId: string; quantity: number; price: number }[]
): Promise<{ items: ValidatedCartItem[]; error?: string }> {
  if (!items.length) return { items: [], error: "Cart is empty" };

  if (!isDatabaseConfigured()) {
    return {
      items: items.map((item) => ({
        productId: item.productId,
        name: "Product",
        slug: item.productId,
        price: item.price,
        quantity: item.quantity,
      })),
    };
  }

  const validated: ValidatedCartItem[] = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product || !product.active) {
      return { items: [], error: "A product in your cart is no longer available" };
    }

    if (product.stock < item.quantity) {
      return {
        items: [],
        error: `${product.name} only has ${product.stock} left in stock`,
      };
    }

    validated.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity: item.quantity,
      image: pickProductImage(product.images) ?? undefined,
      fragrance: product.fragrance,
      categoryLabel: getCategoryLabel(product.category),
    });
  }

  return { items: validated };
}

export function getSiteUrl(): string {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
