import type { Category } from "@prisma/client";

export type ProductCategoryConfig = {
  value: Category;
  slug: string;
  label: string;
  description: string;
  /** Optional tile image (falls back to gradient) */
  image?: string;
};

/** Storefront navigation categories (homepage, footer, mobile menu). */
export type ShopCategoryMenuItem = {
  slug: string;
  label: string;
  description: string;
  /** Prisma categories included in this menu item. */
  values: Category[];
  /** Hide from nav until products exist in this category. */
  hidden?: boolean;
};

export const SHOP_CATEGORY_MENU: ShopCategoryMenuItem[] = [
  {
    slug: "bar-soap",
    label: "Bar Soap",
    description: "Hand-poured botanical bars for a rich, creamy lather.",
    values: ["BAR_SOAP"],
  },
  {
    slug: "bath-body",
    label: "Bath & Body Products",
    description: "Body wash, lotions, and scrubs for everyday ritual.",
    values: ["BATH_BODY"],
  },
  {
    slug: "candles",
    label: "Candles",
    description: "Scent-forward candles for calm, cozy spaces.",
    values: ["CANDLES"],
  },
  {
    slug: "accessories",
    label: "Accessories",
    description: "Soap dishes, bags, and little extras for your ritual.",
    values: ["ACCESSORIES"],
    hidden: true,
  },
  {
    slug: "gift-set",
    label: "Gift Set",
    description: "Curated sets wrapped and ready to gift.",
    values: ["GIFT_SET"],
  },
];

/** Categories shown in navbar, footer, and homepage tiles. */
export const VISIBLE_SHOP_CATEGORY_MENU = SHOP_CATEGORY_MENU.filter(
  (item) => !item.hidden
);

const SHOP_CATEGORY_SLUG_ALIASES: Record<string, string> = {
  "gift-sets": "gift-set",
  "bar-soaps": "bar-soap",
};

export function getShopCategoryBySlug(
  slug: string
): ShopCategoryMenuItem | undefined {
  const normalized = SHOP_CATEGORY_SLUG_ALIASES[slug] ?? slug;
  return SHOP_CATEGORY_MENU.find((c) => c.slug === normalized);
}

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
    description: "Body wash, lotions, scrubs, and everyday bath essentials.",
  },
  {
    value: "CANDLES",
    slug: "candles",
    label: "Candles",
    description: "Scent-forward candles for calm, cozy spaces.",
  },
  {
    value: "ACCESSORIES",
    slug: "accessories",
    label: "Accessories",
    description: "Soap dishes, bags, and ritual extras.",
  },
  {
    value: "GIFT_SET",
    slug: "gift-set",
    label: "Gift Set",
    description: "Curated sets wrapped and ready to gift.",
    image: "/images/hero-soaps.jpg",
  },
];

export function getCategoryBySlug(slug: string): ProductCategoryConfig | undefined {
  const shop = getShopCategoryBySlug(slug);
  if (shop && shop.values.length === 1) {
    return getCategoryByValue(shop.values[0]);
  }
  return PRODUCT_CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByValue(value: Category): ProductCategoryConfig | undefined {
  return PRODUCT_CATEGORIES.find((c) => c.value === value);
}

export function getCategoryDisplayLabel(value: Category | string): string {
  const config = getCategoryByValue(value as Category);
  if (config) return config.label;

  const legacy: Record<string, string> = {
    SOAP: "Bar Soap",
    BODY_WASH: "Bath & Body Products",
    LOTION: "Bath & Body Products",
    SCRUB: "Bath & Body Products",
    AROMATHERAPY: "Candles",
  };
  if (legacy[value]) return legacy[value];

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getCategoryHref(value: Category): string {
  const config = getCategoryByValue(value);
  return config ? `/collections/category/${config.slug}` : "/collections";
}
