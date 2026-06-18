"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ScentVariant } from "@/lib/product-variants";

function ScentThumbnail({
  label,
  image,
  selected,
}: {
  label: string;
  image?: string;
  selected: boolean;
}) {
  return (
    <div
      className={cn(
        "relative h-12 w-12 shrink-0 overflow-hidden border bg-stone-100",
        selected ? "border-terra" : "border-green/10"
      )}
      style={{ borderRadius: "2px" }}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          className="object-cover"
          sizes="48px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-green/10">
          <span className="font-serif text-lg text-green/40">{label.charAt(0)}</span>
        </div>
      )}
    </div>
  );
}

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
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {variants.map((variant) => {
          const selected = variant.slug === currentSlug;
          const disabled = !variant.inStock && !selected;

          return (
            <Link
              key={variant.id}
              href={`/collections/${variant.slug}`}
              aria-current={selected ? "true" : undefined}
              aria-label={`${variant.label}${variant.inStock ? "" : ", sold out"}`}
              className={cn(
                "flex min-h-[3.75rem] items-center gap-3 border p-2 text-sm transition-all duration-250 sm:min-w-[9.5rem]",
                selected
                  ? "border-terra bg-terra/10 text-green"
                  : disabled
                    ? "border-green/10 bg-stone-50 text-muted"
                    : "border-green/15 bg-white text-green hover:border-green/40"
              )}
              style={{ borderRadius: "2px" }}
            >
              <ScentThumbnail
                label={variant.label}
                image={variant.image}
                selected={selected}
              />
              <span className="min-w-0 flex-1">
                <span className="label-caps block leading-snug">{variant.label}</span>
                {!variant.inStock ? (
                  <span className="mt-0.5 block text-xs text-muted">Sold out</span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
