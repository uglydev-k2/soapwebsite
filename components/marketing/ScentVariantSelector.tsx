"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ScentVariant } from "@/lib/product-variants";

function ScentThumbnail({
  label,
  image,
  selected,
  compact = false,
}: {
  label: string;
  image?: string;
  selected: boolean;
  compact?: boolean;
}) {
  const size = compact ? "h-9 w-9" : "h-12 w-12";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden border bg-stone-100",
        size,
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
          sizes={compact ? "36px" : "48px"}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-green/10">
          <span
            className={cn(
              "font-serif text-green/40",
              compact ? "text-sm" : "text-lg"
            )}
          >
            {label.charAt(0)}
          </span>
        </div>
      )}
    </div>
  );
}

export function ScentVariantSelector({
  variants,
  currentSlug,
  compact = false,
}: {
  variants: ScentVariant[];
  currentSlug: string;
  baseName?: string;
  compact?: boolean;
}) {
  if (variants.length <= 1) return null;

  return (
    <div className={compact ? "mt-2" : "mb-8"}>
      {!compact ? (
        <p className="label-caps text-muted mb-3">Choose scent</p>
      ) : (
        <p className="label-caps mb-2 text-[0.65rem] text-muted">
          {variants.length} scents available
        </p>
      )}
      <div
        className={
          compact
            ? "flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
        }
      >
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
                "flex items-center border text-sm transition-all duration-250",
                compact
                  ? "min-w-[5.5rem] shrink-0 flex-col gap-1 p-1.5"
                  : "min-h-[3.75rem] gap-3 p-2 sm:min-w-[9.5rem]",
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
                compact={compact}
              />
              <span className={cn("min-w-0 text-center", compact ? "w-full px-0.5" : "flex-1")}>
                <span
                  className={cn(
                    "label-caps block leading-snug",
                    compact && "text-[0.6rem]"
                  )}
                >
                  {variant.label}
                </span>
                {!variant.inStock ? (
                  <span className={cn("block text-muted", compact ? "text-[0.55rem]" : "mt-0.5 text-xs")}>
                    Sold out
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
