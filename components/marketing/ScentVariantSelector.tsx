"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ScentVariant } from "@/lib/product-variants";

function ScentSwatch({
  variant,
  selected,
  size,
  onSelect,
}: {
  variant: ScentVariant;
  selected: boolean;
  size: "sm" | "md";
  onSelect: (variant: ScentVariant) => void;
}) {
  const disabled = !variant.inStock && !selected;
  const dimension = size === "sm" ? "h-10 w-10 sm:h-9 sm:w-9" : "h-11 w-11";

  return (
    <button
      type="button"
      aria-current={selected ? "true" : undefined}
      aria-label={`${variant.label}${variant.inStock ? "" : ", sold out"}`}
      title={variant.label}
      disabled={disabled}
      onClick={() => onSelect(variant)}
      className={cn(
        "relative shrink-0 rounded-full p-0.5 transition-all duration-200",
        selected
          ? "ring-2 ring-terra ring-offset-2 ring-offset-cream"
          : "ring-1 ring-green/15 hover:ring-green/40",
        disabled && "cursor-not-allowed opacity-45"
      )}
    >
      <span
        className={cn(
          "relative block overflow-hidden rounded-full bg-stone-100",
          dimension
        )}
      >
        {variant.image ? (
          <Image
            src={variant.image}
            alt=""
            fill
            className="object-cover"
            sizes={size === "sm" ? "36px" : "44px"}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-green/10 font-serif text-sm text-green/50">
            {variant.label.charAt(0)}
          </span>
        )}
        {!variant.inStock ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-white/50"
            style={{
              background:
                "linear-gradient(to top left, transparent calc(50% - 0.5px), rgb(107 94 82 / 0.55), transparent calc(50% + 0.5px))",
            }}
          />
        ) : null}
      </span>
    </button>
  );
}

export function ScentVariantSelector({
  variants,
  currentVariantId,
  compact = false,
  onVariantSelect,
}: {
  variants: ScentVariant[];
  currentVariantId: string;
  compact?: boolean;
  onVariantSelect?: (variant: ScentVariant) => void;
}) {
  if (variants.length <= 1) return null;

  const selected =
    variants.find((variant) => variant.id === currentVariantId) ?? variants[0]!;

  const handleSelect = (variant: ScentVariant) => {
    onVariantSelect?.(variant);
  };

  if (compact) {
    return (
      <div className="mt-2">
        <div className="flex flex-wrap items-center gap-2">
          {variants.map((variant) => (
            <ScentSwatch
              key={variant.id}
              variant={variant}
              selected={variant.id === currentVariantId}
              size="sm"
              onSelect={handleSelect}
            />
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted">
          <span className="label-caps">Scent · </span>
          <span className="text-green">{selected.label}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <p className="label-caps mb-3 text-muted">
        Scent · <span className="text-green">{selected.label}</span>
      </p>
      <div
        role="listbox"
        aria-label="Choose scent"
        className="flex flex-wrap gap-2.5"
      >
        {variants.map((variant) => (
          <ScentSwatch
            key={variant.id}
            variant={variant}
            selected={variant.id === currentVariantId}
            size="md"
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
