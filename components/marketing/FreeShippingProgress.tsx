"use client";

import { formatPrice } from "@/lib/utils";
import {
  FREE_SHIPPING_THRESHOLD,
  getFreeShippingProgress,
} from "@/lib/shipping";

export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const { progress, amountRemaining, qualifies } =
    getFreeShippingProgress(subtotal);

  if (qualifies) {
    return (
      <p className="text-xs text-green">
        You qualify for free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">
        Add {formatPrice(amountRemaining)} for free shipping
      </p>
      <div className="h-1 overflow-hidden bg-green/10">
        <div
          className="h-full bg-terra transition-all duration-400"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
