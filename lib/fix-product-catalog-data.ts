import type { Product } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { inferProductVariantMeta } from "@/lib/product-variants";

const SLUG_FIXES: Record<string, string> = {
  "perfection-solid lotion ": "perfection-solid-lotion",
  "avocado-yogurt leave in conditioner ": "avocado-yogurt-leave-in-conditioner",
  "cologne-oil Perfection for him ": "cologne-oil-perfection-for-him",
  "eucalyptus blue mallee-rosemary": "eucalyptus-rosemary-soap",
};

const BROKEN_IMAGE_URL =
  "https://svwzwmvbweknhaoqjtln.supabase.co/storage/v1/object/public/products/1781126904057-1";

/** Products without dedicated photos — show the category gradient placeholder instead. */
const IMAGELESS_SLUGS = new Set(["wax-tart", "bath-bomb", "beard-oil", "bath-tea"]);

export type CatalogCleanupResult = {
  trimmed: number;
  slugsFixed: number;
  imagesFixed: number;
  skippedSlugs: string[];
};

function productsShareScentLine(a: Product, b: Product): boolean {
  if (a.variantGroup && b.variantGroup && a.variantGroup === b.variantGroup) {
    return true;
  }

  const aMeta = inferProductVariantMeta(a);
  const bMeta = inferProductVariantMeta(b);
  if (!aMeta || !bMeta) return false;

  const aGroup = a.variantGroup ?? aMeta.group;
  const bGroup = b.variantGroup ?? bMeta.group;
  return aGroup === bGroup;
}

function buildSharedImageKeepers(products: Product[]): Map<string, string> {
  const byUrl = new Map<string, Product[]>();

  for (const product of products) {
    for (const url of product.images) {
      if (!url || url === BROKEN_IMAGE_URL) continue;
      const group = byUrl.get(url) ?? [];
      group.push(product);
      byUrl.set(url, group);
    }
  }

  const keepers = new Map<string, string>();

  for (const [url, sharers] of Array.from(byUrl.entries())) {
    if (sharers.length <= 1) continue;

    const unrelatedGroups = sharers.reduce<Product[][]>((groups, product) => {
      const existing = groups.find((group) =>
        group.some((member) => productsShareScentLine(member, product))
      );
      if (existing) {
        existing.push(product);
      } else {
        groups.push([product]);
      }
      return groups;
    }, []);

    if (unrelatedGroups.length <= 1) {
      continue;
    }

    const keeper = [...sharers].sort(
      (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
    )[0];
    keepers.set(url, keeper.id);
  }

  return keepers;
}

export async function fixProductCatalogData(): Promise<CatalogCleanupResult> {
  const products = await prisma.product.findMany();
  const sharedImageKeepers = buildSharedImageKeepers(products);
  let trimmed = 0;
  let slugsFixed = 0;
  let imagesFixed = 0;
  const skippedSlugs: string[] = [];

  for (const product of products) {
    const updates: {
      name?: string;
      fragrance?: string | null;
      slug?: string;
      images?: string[];
    } = {};

    const trimmedName = product.name.trim();
    if (trimmedName !== product.name) {
      updates.name = trimmedName;
      trimmed += 1;
    }

    if (product.fragrance && product.fragrance !== product.fragrance.trim()) {
      updates.fragrance = product.fragrance.trim();
    }

    const slugFix = SLUG_FIXES[product.slug];
    if (slugFix) {
      const taken = await prisma.product.findUnique({ where: { slug: slugFix } });
      if (taken && taken.id !== product.id) {
        skippedSlugs.push(`${product.slug} -> ${slugFix}`);
      } else {
        updates.slug = slugFix;
        slugsFixed += 1;
      }
    }

    let images = product.images.filter((url) => url && url !== BROKEN_IMAGE_URL);

    if (IMAGELESS_SLUGS.has(product.slug)) {
      images = [];
    } else {
      images = images.filter((url) => {
        const keeperId = sharedImageKeepers.get(url);
        return !keeperId || keeperId === product.id;
      });
    }

    if (
      images.length !== product.images.length ||
      images.some((url, index) => url !== product.images[index])
    ) {
      updates.images = images;
      imagesFixed += 1;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: updates,
      });
    }
  }

  return { trimmed, slugsFixed, imagesFixed, skippedSlugs };
}
