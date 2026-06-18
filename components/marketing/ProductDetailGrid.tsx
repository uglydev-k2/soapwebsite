"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProductGallery from "@/components/marketing/ProductGallery";
import { ScentVariantSelector } from "@/components/marketing/ScentVariantSelector";
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

export function ProductDetailGrid({
  product,
  scentVariants,
  gradient,
  selectedScentLabel,
  detailsBeforeScents,
  detailsAfterScents,
}: {
  product: Pick<Product, "name" | "slug" | "images" | "category">;
  scentVariants: ScentVariant[];
  gradient: string;
  selectedScentLabel: string;
  detailsBeforeScents: ReactNode;
  detailsAfterScents: ReactNode;
}) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState(product.slug);

  useEffect(() => {
    setActiveSlug(product.slug);
  }, [product.slug]);

  const activeVariant = useMemo(
    () => scentVariants.find((variant) => variant.slug === activeSlug),
    [activeSlug, scentVariants]
  );

  const galleryImages = resolveGalleryImages(activeVariant, product.images);
  const activeScentLabel = activeVariant?.label ?? selectedScentLabel;

  const handleVariantSelect = (variant: ScentVariant) => {
    setActiveSlug(variant.slug);
    router.replace(`/collections/${variant.slug}`, { scroll: false });
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
      <ProductGallery
        key={activeSlug}
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
        {scentVariants.length > 0 ? (
          <p className="mb-4 text-muted">
            <span className="label-caps">Scent · </span>
            <span className="text-green">{activeScentLabel}</span>
          </p>
        ) : null}
        {detailsBeforeScents}
        {scentVariants.length > 0 ? (
          <ScentVariantSelector
            variants={scentVariants}
            currentSlug={activeSlug}
            onVariantSelect={handleVariantSelect}
          />
        ) : null}
        {detailsAfterScents}
      </div>
    </div>
  );
}
