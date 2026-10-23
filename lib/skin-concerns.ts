export const SKIN_CONCERN_IDS = ["sensitive", "acne", "eczema", "men", "baby"] as const;

export type SkinConcernId = (typeof SKIN_CONCERN_IDS)[number];

type SkinConcernDefinition = {
  label: string;
  description?: string;
  /** When true, only explicit slugs match (no keyword/pattern broadening). */
  curated?: boolean;
  slugPatterns?: RegExp[];
  slugs?: readonly string[];
  keywords: readonly string[];
};

const ACNE_CURATED_SLUGS = [
  "kojic-acid-soap",
  "ginger-turmeric-lemongrass-soap",
  "goatmilk-honey-oatmeal",
  "charcoal-turmeric-tea-tree-face-soap",
  "red-polo-activated-charcoal",
] as const;

export const SKIN_CONCERN_DEFINITIONS: Record<SkinConcernId, SkinConcernDefinition> = {
  sensitive: {
    label: "Sensitive Skin",
    description:
      "Gentle formulas with soft botanicals and no harsh additives.",
    curated: true,
    slugs: ACNE_CURATED_SLUGS,
    keywords: [],
  },
  acne: {
    label: "Acne",
    description:
      "Clarifying bars and washes designed to cleanse without stripping.",
    curated: true,
    slugs: ACNE_CURATED_SLUGS,
    keywords: [],
  },
  eczema: {
    label: "Eczema",
    description:
      "Moisture-forward picks with comforting ingredients for dry skin.",
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
    description:
      "Grounded wood and mint profiles with rich, long-lasting lather.",
    curated: true,
    slugs: [
      "perfection-for-him-scrub-soap",
      "ocean-breeze",
      "extremely-for-him",
      "sandalwood-vanilla",
      "tobacco-vanilla",
      "sophisticated-for-him",
      "red-polo-activated-charcoal",
      "bayrum-soap",
      "bonfire-oatmeal-soap",
      "rich-leather-soap",
    ],
    keywords: [],
  },
  baby: {
    label: "Baby Gifts",
    description:
      "Soft, giftable routines tailored for gentle everyday care.",
    curated: true,
    slugs: ["bebe-soap", "goatmilk-honey-oatmeal", "goatmilk-lotion"],
    keywords: [],
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

  if (definition.curated) {
    return false;
  }

  if (definition.slugPatterns?.some((pattern) => pattern.test(product.slug))) {
    return true;
  }

  const haystack = buildProductHaystack(product);
  return definition.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

export function sortByConcernSlugOrder<T extends { slug: string }>(
  products: T[],
  concern: SkinConcernId
): T[] {
  const slugs = SKIN_CONCERN_DEFINITIONS[concern].slugs;
  if (!slugs?.length) return products;

  const order = new Map(slugs.map((slug, index) => [slug, index]));
  return [...products].sort((a, b) => {
    const aIndex = order.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = order.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex || a.slug.localeCompare(b.slug);
  });
}
