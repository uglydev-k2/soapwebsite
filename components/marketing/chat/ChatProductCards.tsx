"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import type { ChatProductResult } from "@/lib/chat/types";

export function ChatProductCards({ products }: { products: ChatProductResult[] }) {
  if (!products.length) return null;

  return (
    <div className="mt-3 space-y-2">
      {products.map((product) => (
        <ChatProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ChatProductCard({ product }: { product: ChatProductResult }) {
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  return (
    <div
      className="flex gap-3 border border-green/10 bg-white p-2"
      style={{ borderRadius: "2px" }}
    >
      <Link
        href={product.url}
        className="relative h-16 w-16 shrink-0 overflow-hidden bg-stone-100"
        style={{ borderRadius: "2px" }}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-serif text-green/30">
            {product.name.charAt(0)}
          </span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={product.url}
          className="line-clamp-2 font-serif text-sm text-green hover:text-terra"
        >
          {product.name}
        </Link>
        {product.fragrance ? (
          <p className="mt-0.5 text-xs text-muted">{product.fragrance}</p>
        ) : null}
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="font-serif text-sm text-terra">
            {product.priceLabel || formatPrice(product.price)}
          </span>
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => {
              addItem({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image ?? undefined,
              });
              addToast(`${product.name} added to cart`);
            }}
            className="inline-flex items-center gap-1 border border-green/15 px-2 py-1 text-[0.65rem] label-caps text-green transition-colors hover:border-terra hover:bg-terra hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderRadius: "2px" }}
          >
            <ShoppingBag size={12} />
            {product.inStock ? "Add" : "Sold out"}
          </button>
        </div>
      </div>
    </div>
  );
}
