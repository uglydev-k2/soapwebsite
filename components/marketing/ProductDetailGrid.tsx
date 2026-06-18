"use client";

import { useEffect, useMemo, useState } from "react";
import ProductGallery from "@/components/marketing/ProductGallery";
import { ScentVariantSelector } from "@/components/marketing/ScentVariantSelector";
import { ProductScentProvider } from "@/components/marketing/ProductScentContext";
import { getCategoryLabel } from "@/lib/utils";
import type { ScentVariant } from "@/lib/product-variants";
import type { Category, Product } from "@prisma/client";
import type { ReactNode } from "react";

function resolveGalleryImages(
  variant: ScentVariant | undefined,
  fallbackImages: string[]
): string[] {
  if (variant?.images?.length) return variant.images;
  if (variant?.image) return [variant.image];
  return fallbackImages;
}

function getInitialVariantId(
  product: Pick<Product, "slug">,
  scentVariants: ScentVariant[]
): string {
  const legacyMatch = scentVariants.find(
    (variant) => variant.kind === "legacy" && variant.slug === product.slug
  );
  if (legacyMatch) return legacyMatch.id;

  const inStock = scentVariants.find((variant) => variant.inStock);
  if (inStock) return inStock.id;

  if (scentVariants[0]) return scentVariants[0].id;
  return product.slug;
}

export function ProductDetailGrid({
  product,
  scentVariants,
  gradient,
  selectedScentLabel,
  detailsBeforeScents,
  detailsAfterScents,
}: {
  product: Product;
  scentVariants: ScentVariant[];
  gradient: string;
  selectedScentLabel: string;
  detailsBeforeScents: ReactNode;
  detailsAfterScents: ReactNode;
}) {
  const [activeVariantId, setActiveVariantId] = useState(() =>
    getInitialVariantId(product, scentVariants)
  );

  useEffect(() => {
    setActiveVariantId(getInitialVariantId(product, scentVariants));
  }, [product.id, product.slug, scentVariants]);

  const activeVariant = useMemo(
    () => scentVariants.find((variant) => variant.id === activeVariantId) ?? null,
    [activeVariantId, scentVariants]
  );

  const galleryImages = resolveGalleryImages(activeVariant ?? undefined, product.images);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
      <ProductGallery
        key={activeVariantId}
        name={product.name}
        images={galleryImages}
        fallbackGradient={gradient}
      />
      <div>
        <p className="label-caps text-terra mb-2">
          {getCategoryLabel(product.category as Category)}
        </p>
        <h1 className="mb-2 font-serif text-3xl font-semibold text-green sm:text-4xl">
          {product.name}
        </h1>
        {detailsBeforeScents}
        {scentVariants.length > 0 ? (
          <ScentVariantSelector
            variants={scentVariants}
            currentVariantId={activeVariantId}
            onVariantSelect={(variant) => setActiveVariantId(variant.id)}
          />
        ) : selectedScentLabel ? (
          <p className="mb-4 text-muted">
            <span className="label-caps">Scent · </span>
            <span className="text-green">{selectedScentLabel}</span>
          </p>
        ) : null}
        <ProductScentProvider product={product} activeVariant={activeVariant}>
          {detailsAfterScents}
        </ProductScentProvider>
      </div>
    </div>
  );
}
