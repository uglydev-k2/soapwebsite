"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, ShoppingBag } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn, formatPrice, getCategoryGradient, categoryLabels } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { EASE_OUT } from "@/lib/motion";
import { WishlistButton } from "@/components/marketing/WishlistButton";
import { ScentVariantSelector } from "@/components/marketing/ScentVariantSelector";
import type { ScentVariant } from "@/lib/product-variants";
import type { ProductWithMeta } from "@/types";
import type { Category } from "@prisma/client";

interface ProductCardProps {
  product: ProductWithMeta;
  className?: string;
  index?: number;
  scentVariants?: ScentVariant[];
}

export default function ProductCard({
  product,
  className,
  index = 0,
  scentVariants = [],
}: ProductCardProps) {
  const reduced = useReducedMotion();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  const hasScentOptions = scentVariants.length > 1;
  const [previewVariant, setPreviewVariant] = useState<ScentVariant | null>(
    () => scentVariants[0] ?? null
  );
  const selectedVariant = previewVariant ?? scentVariants[0] ?? null;
  const heroImage =
    selectedVariant?.image ??
    selectedVariant?.images?.[0] ??
    product.images[0];
  const productUrl = `/collections/${product.slug}`;
  const activeVariantId = selectedVariant?.id ?? product.id;
  const isOutOfStock = hasScentOptions
    ? !selectedVariant?.inStock
    : product.stock <= 0;
  const hasDiscount =
    product.comparePrice != null && product.comparePrice > product.price;
  const gradient = getCategoryGradient(product.category);

  const handleAddToCart = () => {
    if (hasScentOptions && selectedVariant) {
      if (!selectedVariant.inStock) {
        addToast("This scent is currently out of stock", "error");
        return;
      }
      const isLegacy = selectedVariant.kind === "legacy";
      const cartName = isLegacy
        ? product.name
        : `${product.name} — ${selectedVariant.label}`;
      addItem({
        productId: isLegacy ? selectedVariant.id : product.id,
        scentOptionId: selectedVariant.scentOptionId,
        name: cartName,
        slug: isLegacy ? selectedVariant.slug : product.slug,
        price: product.price,
        image:
          selectedVariant.images[0] ??
          selectedVariant.image ??
          product.images[0],
      });
      addToast(`${cartName} added to cart`);
      return;
    }
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
      <motion.article
        className={cn(
          "group relative flex h-full min-w-0 flex-col overflow-hidden border border-green/10 bg-white",
          className
        )}
        style={{ borderRadius: "2px" }}
        whileHover={
          reduced
            ? undefined
            : { y: -4, scale: 1.02, transition: { duration: 0.35, ease: EASE_OUT } }
        }
      >
        <Link href={productUrl} className="relative block aspect-[3/4] overflow-hidden">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center bg-gradient-to-br transition-transform duration-500 group-hover:scale-110",
                gradient
              )}
            >
              <span className="font-serif text-xl text-green/30 sm:text-2xl">
                {product.name.split(" ")[0]}
              </span>
            </div>
          )}

          {!hasScentOptions && (
            <div className="absolute inset-0 hidden flex-col items-center justify-end gap-2 bg-green-3/0 p-4 transition-all duration-300 group-hover:bg-green-3/40 sm:flex">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                className="flex w-full max-w-[200px] translate-y-6 items-center justify-center gap-2 bg-white px-4 py-2 text-sm text-green opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                style={{ borderRadius: "2px" }}
              >
                <Eye size={16} />
                Quick View
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={isOutOfStock}
                className="flex w-full max-w-[200px] translate-y-8 items-center justify-center gap-2 bg-terra px-4 py-2 text-sm label-caps text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderRadius: "2px" }}
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>
            </div>
          )}

          <div className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3">
            <WishlistButton
              item={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.images[0],
              }}
            />
          </div>

          <div className="absolute left-2 top-2 flex flex-col gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
            {product.featured && (
              <Badge status="Featured" className="bg-terra text-white" />
            )}
            {hasScentOptions && (
              <Badge status={`${scentVariants.length} Scents`} className="bg-green text-white" />
            )}
            {hasDiscount && (
              <Badge status="Sale" className="bg-terra text-white" />
            )}
            {isOutOfStock && (
              <Badge status="Sold Out" className="bg-green-3 text-cream" />
            )}
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <motion.span
            className="label-caps text-green/75"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: reduced ? 0 : 0.2 + index * 0.06 }}
          >
            {categoryLabels[product.category as Category] ?? product.category}
          </motion.span>
          <motion.h3
            className="mt-1 font-serif text-base text-green sm:text-lg"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduced ? 0 : 0.28 + index * 0.06 }}
          >
            <Link
              href={productUrl}
              className="transition-colors duration-250 hover:text-terra"
            >
              {product.name}
            </Link>
          </motion.h3>

          {hasScentOptions ? (
            <ScentVariantSelector
              variants={scentVariants}
              currentVariantId={activeVariantId}
              onVariantSelect={setPreviewVariant}
              compact
            />
          ) : (
            product.fragrance && (
              <p className="mt-1 text-xs text-muted sm:text-sm">{product.fragrance}</p>
            )
          )}

          <div className="mt-auto flex items-center justify-between pt-3 sm:pt-4">
            <motion.div
              className="flex items-baseline gap-2"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: reduced ? 0 : 0.35 + index * 0.06 }}
            >
              <span className="font-serif text-base text-terra sm:text-lg">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && product.comparePrice != null && (
                <span className="text-sm text-muted line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </motion.div>
            {hasScentOptions ? (
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
            ) : (
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
            )}
          </div>
        </div>
      </motion.article>

      {!hasScentOptions && (
        <Modal
          open={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          title={product.name}
        >
          <div className="space-y-4">
            <div
              className={cn(
                "relative aspect-square overflow-hidden bg-gradient-to-br",
                gradient
              )}
            >
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
      )}
    </>
  );
}
