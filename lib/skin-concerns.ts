export const SKIN_CONCERN_IDS = ["sensitive", "acne", "eczema", "men"] as const;

export type SkinConcernId = (typeof SKIN_CONCERN_IDS)[number];

type SkinConcernDefinition = {
  label: string;
  slugPatterns?: RegExp[];
  slugs?: readonly string[];
  keywords: readonly string[];
};

export const SKIN_CONCERN_DEFINITIONS: Record<SkinConcernId, SkinConcernDefinition> = {
  sensitive: {
    label: "Sensitive Skin",
    slugPatterns: [/^goatmilk-/],
    slugs: [
      "bebe-soap",
      "oat-honey-comfort-bar",
      "lavender-chamomile",
      "lavender-oat-sugar-scrub",
      "bonfire-oatmeal-soap",
      "blush-rose-artisan-bar",
    ],
    keywords: [
      "sensitive",
      "colloidal",
      "oatmeal",
      "goat milk",
      "goatmilk",
      "chamomile",
      "bebe",
      "delicate",
      "eczema-prone",
      "fragrance-free",
      "reactive",
      "stressed skin",
      "never tight",
      "comfort bar",
      "dry skin",
    ],
  },
  acne: {
    label: "Acne",
    keywords: ["charcoal", "tea tree", "turmeric", "kojic", "clarifying", "blemish"],
  },
  eczema: {
    label: "Eczema",
    slugPatterns: [/^goatmilk-/],
    keywords: [
      "eczema",
      "colloidal",
      "oatmeal",
      "goat milk",
      "goatmilk",
      "dry skin",
      "moisture",
      "comfort bar",
    ],
  },
  men: {
    label: "Men",
    keywords: ["cedar", "wood", "mint", "spearmint", "cologne", "leather"],
  },
};

export function parseSkinConcern(value?: string): SkinConcernId | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase().trim();
  return SKIN_CONCERN_IDS.find((id) => id === normalized);
}

type MatchableProduct = {
  slug: string;
  name: string;
  description: string;
  fragrance?: string | null;
  ingredients?: string | null;
  scentOptions?: { label: string; fragrance?: string | null }[];
};

export function buildProductHaystack(product: MatchableProduct): string {
  const parts = [
    product.slug,
    product.name,
    product.description,
    product.fragrance,
    product.ingredients,
  ];

  for (const option of product.scentOptions ?? []) {
    parts.push(option.label, option.fragrance);
  }

  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function matchesSkinConcern(
  product: MatchableProduct,
  concern: SkinConcernId
): boolean {
  const definition = SKIN_CONCERN_DEFINITIONS[concern];

  if (definition.slugs?.includes(product.slug)) {
    return true;
  }

  if (definition.slugPatterns?.some((pattern) => pattern.test(product.slug))) {
    return true;
  }

  const haystack = buildProductHaystack(product);
  return definition.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}
