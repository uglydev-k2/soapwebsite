export const dynamic = "force-dynamic";

import { getProductBySlug } from "@/lib/products";
import { notFound } from "next/navigation";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import ProductBundleSelector from "@/components/marketing/ProductBundleSelector";
import ProductGallery from "@/components/marketing/ProductGallery";
import ProductReviews from "@/components/marketing/ProductReviews";
import { TrackRecentlyViewed } from "@/components/marketing/TrackRecentlyViewed";
import { RecentlyViewedStrip } from "@/components/marketing/RecentlyViewedStrip";
import { CompleteYourRitual } from "@/components/marketing/CompleteYourRitual";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ShareProductButton } from "@/components/marketing/ShareProductButton";
import { StockNotifyForm } from "@/components/marketing/StockNotifyForm";
import { ProductCareAccordion } from "@/components/marketing/ProductCareAccordion";
import { WishlistButton } from "@/components/marketing/WishlistButton";
import type { Category } from "@prisma/client";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  return { title: product ? `${product.name} — MsVee Soaps` : "Product" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const gradient = getCategoryGradient(product.category);

  return (
    <section className="pt-32 pb-24 px-6 bg-cream min-h-screen">
      <TrackRecentlyViewed
        productId={product.id}
        name={product.name}
        slug={product.slug}
        price={product.price}
        image={product.images[0]}
      />
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections" },
            { label: product.name },
          ]}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <ProductGallery
            name={product.name}
            images={product.images}
            fallbackGradient={gradient}
          />
          <div>
            <p className="label-caps text-terra mb-2">
              {getCategoryLabel(product.category)}
            </p>
            <h1 className="font-serif text-4xl font-light text-green mb-4">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-2xl text-green">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-muted line-through text-lg">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            <p className="text-muted leading-relaxed mb-8">{product.description}</p>
            {product.fragrance && (
              <p className="mb-4">
                <span className="label-caps text-muted">Fragrance · </span>
                <span className="text-green">{product.fragrance}</span>
              </p>
            )}
            {product.ingredients && (
              <div className="mb-8">
                <p className="label-caps text-muted mb-2">Ingredients</p>
                <p className="text-sm text-muted leading-relaxed">{product.ingredients}</p>
              </div>
            )}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <p className="label-caps text-muted">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
              <ShareProductButton name={product.name} />
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
            {product.stock === 0 ? (
              <div className="mb-8 border border-green/10 bg-white p-6">
                <p className="label-caps text-muted mb-3">Back in stock alert</p>
                <StockNotifyForm productSlug={product.slug} productName={product.name} />
              </div>
            ) : (
              <ProductBundleSelector product={product} disabled={false} />
            )}
            <ProductCareAccordion category={product.category as Category} />
          </div>
        </div>
        <CompleteYourRitual category={product.category as Category} excludeSlug={product.slug} />
        <ProductReviews slug={product.slug} />
        <RecentlyViewedStrip excludeSlug={product.slug} />
      </div>
    </section>
  );
}

function getCategoryGradient(category: string): string {
  const gradients: Record<string, string> = {
    SOAP: "linear-gradient(135deg, #3D6454, #2C4A3E)",
    BODY_WASH: "linear-gradient(135deg, #2C4A3E, #1a2e26)",
    LOTION: "linear-gradient(135deg, #C9A96E, #B5552A)",
    SCRUB: "linear-gradient(135deg, #6B5E52, #3D6454)",
    AROMATHERAPY: "linear-gradient(135deg, #1a2e26, #2C4A3E)",
    GIFT_SET: "linear-gradient(135deg, #B5552A, #8C3F1E)",
  };
  return gradients[category] || gradients.SOAP;
}
