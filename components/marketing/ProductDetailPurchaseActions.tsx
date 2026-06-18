"use client";

import ProductBundleSelector from "@/components/marketing/ProductBundleSelector";
import { StockNotifyForm } from "@/components/marketing/StockNotifyForm";
import { ShareProductButton } from "@/components/marketing/ShareProductButton";
import { WishlistButton } from "@/components/marketing/WishlistButton";
import { useProductScent } from "@/components/marketing/ProductScentContext";

export function ProductDetailPurchaseActions() {
  const context = useProductScent();
  if (!context) return null;

  const { product, activeVariant } = context;
  const stock = activeVariant?.stock ?? product.stock;
  const image =
    activeVariant?.images?.[0] ??
    activeVariant?.image ??
    product.images[0];
  const cartName = activeVariant
    ? `${product.name} — ${activeVariant.label}`
    : product.name;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <p className="label-caps text-muted">
          {stock > 0 ? `${stock} in stock` : "Out of stock"}
        </p>
        <ShareProductButton name={cartName} />
        <WishlistButton
          item={{
            productId:
              activeVariant?.kind === "legacy" ? activeVariant.id : product.id,
            name: cartName,
            slug:
              activeVariant?.kind === "legacy" ? activeVariant.slug : product.slug,
            price: product.price,
            image,
          }}
        />
      </div>
      {stock === 0 ? (
        <div className="mb-8 border border-green/10 bg-white p-6">
          <p className="label-caps text-muted mb-3">Back in stock alert</p>
          <StockNotifyForm productSlug={product.slug} productName={cartName} />
        </div>
      ) : (
        <ProductBundleSelector product={product} disabled={false} />
      )}
    </>
  );
}
