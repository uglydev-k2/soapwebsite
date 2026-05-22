"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, ShoppingBag } from "lucide-react";
import { cn, formatPrice, getCategoryGradient, categoryLabels } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import type { ProductWithMeta } from "@/types";
import type { Category } from "@prisma/client";

interface ProductCardProps {
  product: ProductWithMeta;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  const isOutOfStock = product.stock <= 0;
  const hasDiscount =
    product.comparePrice != null && product.comparePrice > product.price;
  const gradient = getCategoryGradient(product.category);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      addToast("This item is currently out of stock", "error");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
    });
    addToast(`${product.name} added to cart`);
  };

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col overflow-hidden border border-green/10 bg-white",
          className
        )}
        style={{ borderRadius: "2px" }}
      >
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[3/4] overflow-hidden"
        >
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center bg-gradient-to-br",
                gradient
              )}
            >
              <span className="font-serif text-2xl text-green/30">
                {product.name.split(" ")[0]}
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-end justify-center bg-green-3/0 p-4 transition-all duration-300 group-hover:bg-green-3/40">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="flex translate-y-4 items-center gap-2 bg-white px-4 py-2 text-sm text-green opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
              style={{ borderRadius: "2px" }}
            >
              <Eye size={16} />
              Quick View
            </button>
          </div>

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.featured && (
              <Badge status="Featured" className="bg-terra text-white" />
            )}
            {hasDiscount && (
              <Badge status="Sale" className="bg-terra text-white" />
            )}
            {isOutOfStock && (
              <Badge status="Sold Out" className="bg-green-3 text-cream" />
            )}
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <span className="label-caps text-muted">
            {categoryLabels[product.category as Category] ?? product.category}
          </span>
          <h3 className="mt-1 font-serif text-lg text-green">
            <Link
              href={`/products/${product.slug}`}
              className="transition-colors duration-250 hover:text-terra"
            >
              {product.name}
            </Link>
          </h3>
          {product.fragrance && (
            <p className="mt-1 text-sm text-muted">{product.fragrance}</p>
          )}

          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg text-terra">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && product.comparePrice != null && (
                <span className="text-sm text-muted line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "flex h-9 w-9 items-center justify-center border border-green/20 text-green",
                "transition-colors duration-250 hover:border-terra hover:bg-terra hover:text-white",
                "disabled:cursor-not-allowed disabled:opacity-40"
              )}
              style={{ borderRadius: "2px" }}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </article>

      <Modal
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        title={product.name}
      >
        <div className="space-y-4">
          <div className={cn("relative aspect-square overflow-hidden bg-gradient-to-br", gradient)}>
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-serif text-3xl text-green/30">
                  {product.name.split(" ")[0]}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted">{product.description}</p>
          {product.fragrance && (
            <p className="text-sm">
              <span className="label-caps text-muted">Scent: </span>
              <span className="text-green">{product.fragrance}</span>
            </p>
          )}
          <div className="flex items-center justify-between pt-2">
            <span className="font-serif text-2xl text-terra">
              {formatPrice(product.price)}
            </span>
            <Button
              variant="primary"
              onClick={() => {
                handleAddToCart();
                setQuickViewOpen(false);
              }}
              disabled={isOutOfStock}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
