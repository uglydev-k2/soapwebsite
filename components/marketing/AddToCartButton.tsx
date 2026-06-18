"use client";

import { Button } from "@/components/ui/Button";
import { useProductScent } from "@/components/marketing/ProductScentContext";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import type { Product } from "@prisma/client";

export default function AddToCartButton({
  product,
  disabled,
  quantity = 1,
  ctaLabel = "Add to Cart",
}: {
  product: Product;
  disabled?: boolean;
  quantity?: number;
  ctaLabel?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const scentContext = useProductScent();
  const activeVariant = scentContext?.activeVariant ?? null;

  const stock = activeVariant?.stock ?? product.stock;
  const isDisabled = disabled || stock <= 0;
  const image =
    activeVariant?.images?.[0] ??
    activeVariant?.image ??
    product.images[0];
  const cartName = activeVariant
    ? `${product.name} — ${activeVariant.label}`
    : product.name;

  return (
    <Button
      disabled={isDisabled}
      size="lg"
      onClick={() => {
        addItem(
          {
            productId:
              activeVariant?.kind === "legacy" ? activeVariant.id : product.id,
            scentOptionId: activeVariant?.scentOptionId,
            name: cartName,
            slug:
              activeVariant?.kind === "legacy" ? activeVariant.slug : product.slug,
            price: product.price,
            image,
          },
          quantity
        );
        addToast(`${cartName} added to cart`);
      }}
    >
      {ctaLabel}
    </Button>
  );
}
