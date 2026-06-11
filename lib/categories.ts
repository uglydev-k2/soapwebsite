import type { Category } from "@prisma/client";

export const PRODUCT_CATEGORY_VALUES = [
  "BAR_SOAP",
  "BATH_BODY",
  "CANDLES",
  "ACCESSORIES",
  "GIFT_SET",
] as const satisfies readonly Category[];

export type ProductCategoryValue = (typeof PRODUCT_CATEGORY_VALUES)[number];

export type ProductCategoryConfig = {
  value: Category;
  slug: string;
  label: string;
  description: string;
  /** Optional tile image (falls back to gradient) */
  image?: string;
};

export const PRODUCT_CATEGORIES: ProductCategoryConfig[] = [
  {
    value: "BAR_SOAP",
    slug: "bar-soap",
    label: "Bar Soap",
    description: "Hand-poured botanical bars for a rich, creamy lather.",
    image: "/images/products/blush-rose-bar.jpg",
  },
  {
    value: "BATH_BODY",
    slug: "bath-body",
    label: "Bath & Body Products",
    description: "Cleansers, lotions, and scrubs for head-to-toe ritual.",
  },
  {
    value: "CANDLES",
    slug: "candles",
    label: "Candles",
    description: "Clean-burning scents to warm your space.",
  },
  {
    value: "ACCESSORIES",
    slug: "accessories",
    label: "Accessories",
    description: "Soap dishes, bags, and ritual essentials.",
  },
  {
    value: "GIFT_SET",
    slug: "gift-set",
    label: "Gift Set",
    description: "Curated rituals wrapped for gifting moments.",
    image: "/images/hero-soaps.jpg",
  },
];

export function getCategoryBySlug(slug: string): ProductCategoryConfig | undefined {
  return PRODUCT_CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByValue(value: Category): ProductCategoryConfig | undefined {
  return PRODUCT_CATEGORIES.find((c) => c.value === value);
}

export function getCategoryHref(value: Category): string {
  const config = getCategoryByValue(value);
  return config ? `/collections/category/${config.slug}` : "/collections";
}
