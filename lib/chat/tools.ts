import { tool } from "ai";
import { z } from "zod";
import { getActiveProducts, getProductBySlug, getProductsByIngredientKeywords } from "@/lib/products";
import { INGREDIENT_GLOSSARY } from "@/lib/content/ingredients";
import {
  getFaqItems,
  getShippingSections,
  GIFT_GUIDE_SECTIONS,
  SCENT_FINDER_OPTIONS,
} from "@/lib/content/site-content";
import { getPublicStoreSettings } from "@/lib/store-settings";
import { formatPrice } from "@/lib/utils";
import type { ChatProductResult } from "@/lib/chat/types";
import type { Category } from "@prisma/client";

function toChatProduct(product: {
  id: string;
  name: string;
  slug: string;
  price: number;
  fragrance: string | null;
  images: string[];
  stock: number;
}): ChatProductResult {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    priceLabel: formatPrice(product.price),
    fragrance: product.fragrance,
    image: product.images[0] ?? null,
    inStock: product.stock > 0,
    url: `/collections/${product.slug}`,
  };
}

export function createChatTools() {
  return {
    searchProducts: tool({
      description:
        "Search the live product catalog by keyword, scent name, product type, or customer need.",
      inputSchema: z.object({
        query: z.string().min(1).describe("Search terms, e.g. lavender bar soap"),
        category: z
          .enum([
            "BAR_SOAP",
            "BATH_BODY",
            "CANDLES",
            "ACCESSORIES",
            "GIFT_SET",
          ])
          .optional(),
        limit: z.number().int().min(1).max(6).default(4),
      }),
      execute: async ({ query, category, limit }) => {
        const products = await getActiveProducts({
          q: query,
          category: category as Category | undefined,
          sort: "featured",
        });
        return {
          query,
          count: products.length,
          products: products.slice(0, limit).map(toChatProduct),
        };
      },
    }),

    getProductDetails: tool({
      description: "Get full details for one product by its URL slug.",
      inputSchema: z.object({
        slug: z.string().min(1),
      }),
      execute: async ({ slug }) => {
        const product = await getProductBySlug(slug);
        if (!product) {
          return { found: false as const, slug };
        }
        return {
          found: true as const,
          product: {
            ...toChatProduct(product),
            description: product.description,
            ingredients: product.ingredients,
            category: product.category,
          },
        };
      },
    }),

    getFaqAndPolicies: tool({
      description:
        "Get official FAQ, shipping, returns, and store policy information.",
      inputSchema: z.object({
        topic: z
          .enum(["all", "shipping", "returns", "natural", "international"])
          .default("all"),
      }),
      execute: async ({ topic }) => {
        const settings = await getPublicStoreSettings();
        const faq = getFaqItems(settings);
        const shipping = getShippingSections();

        if (topic === "shipping") {
          return { shipping, faq: faq.filter((item) => item.question.toLowerCase().includes("ship")) };
        }
        if (topic === "returns") {
          return {
            shipping: shipping.filter((s) =>
              /return|exchange/i.test(s.title + s.body)
            ),
            faq: faq.filter((item) => /return|exchange/i.test(item.question)),
          };
        }
        if (topic === "natural") {
          return { faq: faq.filter((item) => /natural|sensitive/i.test(item.question)) };
        }
        if (topic === "international") {
          return { faq: faq.filter((item) => /international/i.test(item.question)) };
        }
        return { faq, shipping };
      },
    }),

    getIngredientInfo: tool({
      description:
        "Explain a skincare ingredient used in MV Luscious Lather products.",
      inputSchema: z.object({
        keyword: z.string().min(1),
      }),
      execute: async ({ keyword }) => {
        const needle = keyword.toLowerCase();
        const matches = INGREDIENT_GLOSSARY.filter(
          (entry) =>
            entry.name.toLowerCase().includes(needle) ||
            entry.keywords.some((k) => k.includes(needle) || needle.includes(k))
        );
        const products = await getProductsByIngredientKeywords([needle]);
        return {
          keyword,
          ingredients: matches.slice(0, 4).map((entry) => ({
            name: entry.name,
            benefit: entry.benefit,
            description: entry.description,
          })),
          relatedProducts: products.slice(0, 4).map(toChatProduct),
        };
      },
    }),

    getScentRecommendations: tool({
      description:
        "Recommend scent profiles and collection links based on mood or product format.",
      inputSchema: z.object({
        mood: z
          .enum(["calm", "earthy", "bright", "warm", "any"])
          .default("any"),
        format: z
          .enum(["bar", "body", "candle", "gift", "any"])
          .default("any"),
      }),
      execute: async ({ mood, format }) => {
        const moodMap: Record<string, string> = {
          calm: "lavender",
          earthy: "cedar",
          bright: "citrus",
          warm: "amber",
        };
        const formatMap: Record<string, string> = {
          bar: "bar-soap",
          body: "bath-body",
          candle: "candles",
          gift: "gift-set",
        };

        const scent =
          mood !== "any" ? moodMap[mood] : undefined;
        const categorySlug =
          format !== "any" ? formatMap[format] : undefined;

        let href = "/collections";
        if (categorySlug && scent) {
          href = `/collections/category/${categorySlug}?scent=${scent}`;
        } else if (categorySlug) {
          href = `/collections/category/${categorySlug}`;
        } else if (scent) {
          href = `/collections?scent=${scent}`;
        }

        const products = await getActiveProducts({
          scent,
          categories:
            format === "bar"
              ? ["BAR_SOAP"]
              : format === "body"
                ? ["BATH_BODY"]
                : format === "candle"
                  ? ["CANDLES"]
                  : format === "gift"
                    ? ["GIFT_SET"]
                    : undefined,
          sort: "featured",
        });

        return {
          mood,
          format,
          collectionUrl: href,
          options: SCENT_FINDER_OPTIONS,
          products: products.slice(0, 4).map(toChatProduct),
        };
      },
    }),

    getGiftIdeas: tool({
      description: "Get curated gift guide sections and matching products.",
      inputSchema: z.object({
        budget: z.enum(["any", "under30", "premium"]).default("any"),
      }),
      execute: async ({ budget }) => {
        const products = await getActiveProducts({
          sort: budget === "under30" ? "price-asc" : "featured",
        });
        const filtered =
          budget === "under30"
            ? products.filter((p) => p.price <= 30)
            : products;

        return {
          sections: GIFT_GUIDE_SECTIONS,
          products: filtered.slice(0, 4).map(toChatProduct),
        };
      },
    }),
  };
}
