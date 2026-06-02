"use client";

import { Button } from "@/components/ui/Button";
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

  return (
    <Button
      disabled={disabled}
      size="lg"
      onClick={() => {
        addItem({
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images[0],
        }, quantity);
        addToast(`${product.name} added to cart`);
      }}
    >
      {ctaLabel}
    </Button>
  );
}
