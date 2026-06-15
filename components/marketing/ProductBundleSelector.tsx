"use client";

import { useMemo, useState } from "react";
import type { Product } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import AddToCartButton from "@/components/marketing/AddToCartButton";
import {
  BUNDLE_OPTIONS,
  getBundleLineTotal,
} from "@/lib/bundle-pricing";

export default function ProductBundleSelector({
  product,
  disabled,
}: {
  product: Product;
  disabled?: boolean;
}) {
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const totalPrice = useMemo(
    () => getBundleLineTotal(product.price, selectedQty),
    [product.price, selectedQty]
  );

  return (
    <div className="space-y-4 border border-green/10 bg-white p-5" style={{ borderRadius: "2px" }}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label-caps text-terra">Bundle Packs</p>
          <p className="mt-1 text-sm text-muted">Choose quantity and add in one tap.</p>
        </div>
        <p className="font-serif text-xl text-green">{formatPrice(totalPrice)}</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {BUNDLE_OPTIONS.map((option) => (
          <button
            key={option.quantity}
            type="button"
            onClick={() => setSelectedQty(option.quantity)}
            className={cn(
              "min-h-[3rem] border px-3 py-3 text-left transition-all duration-250 sm:py-2",
              selectedQty === option.quantity
                ? "border-terra bg-terra/5"
                : "border-green/15 bg-white hover:border-green/40"
            )}
            style={{ borderRadius: "2px" }}
          >
            <p className="label-caps text-green">{option.label}</p>
            <p className="mt-1 text-xs text-muted">{option.note}</p>
            <p className="mt-2 text-sm font-medium text-green">
              {formatPrice(getBundleLineTotal(product.price, option.quantity))}
              {option.discount > 0 ? (
                <span className="ml-1 text-xs text-terra">Save ${option.discount}</span>
              ) : null}
            </p>
          </button>
        ))}
      </div>

      <AddToCartButton
        product={product}
        disabled={disabled}
        quantity={selectedQty}
        ctaLabel={`Add ${selectedQty} to Cart`}
      />
    </div>
  );
}
