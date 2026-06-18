"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ScentVariant } from "@/lib/product-variants";

export function ScentVariantSelector({
  variants,
  currentSlug,
  baseName,
}: {
  variants: ScentVariant[];
  currentSlug: string;
  baseName: string;
}) {
  if (variants.length <= 1) return null;

  return (
    <div className="mb-8">
      <p className="label-caps text-muted mb-3">{baseName} · Choose scent</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const selected = variant.slug === currentSlug;
          const disabled = !variant.inStock && !selected;

          return (
            <Link
              key={variant.id}
              href={`/collections/${variant.slug}`}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "min-h-[2.75rem] border px-4 py-2 text-sm transition-all duration-250",
                selected
                  ? "border-terra bg-terra/10 text-green"
                  : disabled
                    ? "border-green/10 bg-stone-50 text-muted"
                    : "border-green/15 bg-white text-green hover:border-green/40"
              )}
              style={{ borderRadius: "2px" }}
            >
              <span className="label-caps">{variant.label}</span>
              {!variant.inStock ? (
                <span className="ml-2 text-xs text-muted">Sold out</span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
