"use client";

import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import type { Product } from "@prisma/client";

export default function AddToCartButton({
  product,
  disabled,
}: {
  product: Product;
  disabled?: boolean;
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
        });
        addToast(`${product.name} added to cart`);
      }}
    >
      Add to Cart
    </Button>
  );
}
