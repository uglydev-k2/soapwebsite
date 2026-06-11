"use client";

import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice, getCategoryGradient } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";

export function WishlistPageClient() {
  const { items, remove } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  if (items.length === 0) {
    return (
      <div className="border border-green/10 bg-white py-16 text-center">
        <p className="subheading text-2xl">Your wishlist is empty</p>
        <p className="mt-3 text-sm text-muted">
          Save products you love while browsing collections.
        </p>
        <Link
          href="/collections"
          className="mt-8 inline-flex items-center justify-center bg-terra px-8 py-4 text-sm label-caps text-white hover:bg-terra-2"
          style={{ borderRadius: 0 }}
        >
          Browse Collections
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.productId}
          className="flex flex-col gap-4 border border-green/10 bg-white p-5 sm:flex-row sm:items-center"
          style={{ borderRadius: "2px" }}
        >
          <div
            className={cn(
              "h-24 w-20 shrink-0 bg-gradient-to-br",
              getCategoryGradient("BAR_SOAP")
            )}
          />
          <div className="flex-1">
            <Link
              href={`/collections/${item.slug}`}
              className="font-serif text-xl text-green hover:text-terra"
            >
              {item.name}
            </Link>
            <p className="mt-1 font-serif text-lg text-terra">
              {formatPrice(item.price)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => {
                addItem({
                  productId: item.productId,
                  name: item.name,
                  slug: item.slug,
                  price: item.price,
                  image: item.image,
                });
                addToast(`${item.name} added to cart`);
              }}
            >
              Add to Cart
            </Button>
            <button
              type="button"
              onClick={() => remove(item.productId)}
              className="label-caps text-muted hover:text-terra"
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
