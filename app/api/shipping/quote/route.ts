import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import { calculateShippingQuote } from "@/lib/shipping-calculator";
import { getBundleLineTotal } from "@/lib/bundle-pricing";
import { getCountryCode, isUsCountry } from "@/lib/shipping";
import { getCheckoutSettings } from "@/lib/checkout";
import type { Category } from "@prisma/client";

const quoteSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
        price: z.number().positive(),
      })
    )
    .min(1),
  country: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().optional(),
});

export const POST = withApiHandler("shipping.quote", async (request: NextRequest) => {
  const body = await request.json();
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid shipping quote request");
  }

  const { items, country, state, postalCode } = parsed.data;
  const countryCode = getCountryCode(country);

  if (isUsCountry(countryCode) && !state?.trim()) {
    return errorResponse("State is required for U.S. shipping quotes");
  }

  const subtotal = items.reduce(
    (sum, item) => sum + getBundleLineTotal(item.price, item.quantity),
    0
  );

  const enriched = await Promise.all(
    items.map(async (item) => {
      let category: Category = "BAR_SOAP";
      let name = "";
      let slug = "";
      let weightOz: number | null = null;

      if (isDatabaseConfigured()) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { category: true, name: true, slug: true, weightOz: true },
        });
        if (product) {
          category = product.category;
          name = product.name;
          slug = product.slug;
          weightOz = product.weightOz;
        }
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        category,
        name,
        slug,
        weightOz,
      };
    })
  );

  const quote = calculateShippingQuote({
    items: enriched,
    country: countryCode,
    state,
    postalCode,
    subtotal,
    freeShippingThreshold: (await getCheckoutSettings()).freeShippingThreshold,
  });

  return jsonResponse(quote);
});
