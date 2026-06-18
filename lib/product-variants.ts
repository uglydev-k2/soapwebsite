import type { Product } from "@prisma/client";

export type ScentVariant = {
  id: string;
  slug: string;
  label: string;
  fragrance: string | null;
  stock: number;
  price: number;
  inStock: boolean;
  image?: string;
};

type VariantRule = {
  group: string;
  baseName: string;
  regex: RegExp;
  labelIndex?: number;
};

const VARIANT_RULES: VariantRule[] = [
  {
    group: "solid-lotion",
    baseName: "Solid Lotion",
    regex: /^(.+?)\s+SOLID\s+LOTION\s*$/i,
  },
  {
    group: "body-butter",
    baseName: "Body Butter",
    regex: /^(.+?)\s+BODY\s+BUTTER\s*$/i,
  },
  {
    group: "sugar-scrub",
    baseName: "Sugar Scrub",
    regex: /^(.+?)\s+SUGAR\s+SCRUB\s*$/i,
  },
  {
    group: "hand-moisturizer",
    baseName: "Hand Moisturizer",
    regex: /^(.+?)\s+HAND\s+MOISTURIZER\s*$/i,
  },
  {
    group: "body-moisturizer",
    baseName: "Moisturizer",
    regex: /^(.+?)\s+MOISTURIZER\s*$/i,
  },
  {
    group: "tallow-butter",
    baseName: "Tallow Butter",
    regex: /^TALLOW\s+(.+?)\s+BUTTER\s*$/i,
    labelIndex: 1,
  },
  {
    group: "magnesium-butter",
    baseName: "Magnesium Butter",
    regex: /^(.+?)\s+MAGNESIUM\s+BUTTER\s*$/i,
  },
  {
    group: "salt-scrub",
    baseName: "Salt Scrub",
    regex: /^(.+?)\s+SALT\s+SCRUB\s*$/i,
  },
  {
    group: "creme-scrub",
    baseName: "Creme Scrub",
    regex: /^(.+?)\s+CREME\s+SCRUB\s*$/i,
  },
];

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function inferProductVariantMeta(
  product: Pick<Product, "name" | "fragrance" | "variantGroup" | "variantLabel">
) {
  if (product.variantGroup) {
    const rule = VARIANT_RULES.find((entry) => entry.group === product.variantGroup);
    const label =
      product.variantLabel?.trim() ||
      product.fragrance?.trim() ||
      product.name.trim();

    return {
      group: product.variantGroup,
      label: titleCase(label),
      baseName: rule?.baseName ?? "Product",
    };
  }

  const normalized = product.name.trim().replace(/\s+/g, " ");
  for (const rule of VARIANT_RULES) {
    const match = normalized.match(rule.regex);
    if (!match) continue;

    const rawLabel = match[rule.labelIndex ?? 1]?.trim();
    if (!rawLabel) continue;

    return {
      group: rule.group,
      label: titleCase(rawLabel),
      baseName: rule.baseName,
    };
  }

  return null;
}

export function getVariantLabel(product: Pick<Product, "name" | "fragrance" | "variantGroup" | "variantLabel">): string {
  const inferred = inferProductVariantMeta(product);
  if (inferred) return inferred.label;
  if (product.fragrance?.trim()) return titleCase(product.fragrance.trim());
  return product.name.trim();
}

export function toScentVariant(product: Product): ScentVariant {
  return {
    id: product.id,
    slug: product.slug,
    label: getVariantLabel(product),
    fragrance: product.fragrance,
    stock: product.stock,
    price: product.price,
    inStock: product.stock > 0,
    image: product.images[0] || undefined,
  };
}

export function groupProductsByVariant(
  products: Product[]
): Map<string, Product[]> {
  const groups = new Map<string, Product[]>();

  for (const product of products) {
    const meta = inferProductVariantMeta(product);
    if (!meta) continue;

    const groupKey = product.variantGroup ?? meta.group;
    const existing = groups.get(groupKey) ?? [];
    existing.push(product);
    groups.set(groupKey, existing);
  }

  for (const [key, items] of Array.from(groups.entries())) {
    groups.set(
      key,
      [...items].sort((a, b) => getVariantLabel(a).localeCompare(getVariantLabel(b)))
    );
  }

  return groups;
}

export function getScentVariantsForProduct(
  product: Product,
  catalog: Product[]
): ScentVariant[] {
  const meta = inferProductVariantMeta(product);
  if (!meta) return [];

  const groupKey = product.variantGroup ?? meta.group;
  const siblings = catalog.filter((candidate) => {
    const candidateMeta = inferProductVariantMeta(candidate);
    if (!candidateMeta) return false;
    const candidateGroup = candidate.variantGroup ?? candidateMeta.group;
    return candidateGroup === groupKey && candidate.active;
  });

  if (siblings.length <= 1) return [];

  return siblings.map(toScentVariant);
}
