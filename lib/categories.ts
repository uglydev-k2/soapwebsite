import type { Category } from "@prisma/client";

export type ProductCategoryConfig = {
  value: Category;
  slug: string;
  label: string;
  description: string;
};

export const PRODUCT_CATEGORIES: ProductCategoryConfig[] = [
  {
    value: "SOAP",
    slug: "bar-soap",
    label: "Bar Soaps",
    description: "Hand-poured botanical bars for a rich, creamy lather.",
  },
  {
    value: "BODY_WASH",
    slug: "body-wash",
    label: "Body Wash",
    description: "Gentle cleansers that nourish without stripping moisture.",
  },
  {
    value: "LOTION",
    slug: "body-lotion",
    label: "Body Lotion",
    description: "Silky hydration with skin-loving botanical oils.",
  },
  {
    value: "SCRUB",
    slug: "sugar-scrub",
    label: "Sugar Scrub",
    description: "Exfoliating rituals for smooth, refreshed skin.",
  },
  {
    value: "AROMATHERAPY",
    slug: "aromatherapy",
    label: "Aromatherapy",
    description: "Scent-forward essentials for calm and balance.",
  },
  {
    value: "GIFT_SET",
    slug: "gift-sets",
    label: "Gift Sets",
    description: "Curated rituals wrapped for gifting moments.",
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
