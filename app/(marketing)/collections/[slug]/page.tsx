export const dynamic = "force-dynamic";

import { getProductBySlug, getProductScentVariants } from "@/lib/products";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { ProductDetailGrid } from "@/components/marketing/ProductDetailGrid";
import { ProductDetailPurchaseActions } from "@/components/marketing/ProductDetailPurchaseActions";
import ProductReviews from "@/components/marketing/ProductReviews";
import { TrackRecentlyViewed } from "@/components/marketing/TrackRecentlyViewed";
import { RecentlyViewedStrip } from "@/components/marketing/RecentlyViewedStrip";
import { CompleteYourRitual } from "@/components/marketing/CompleteYourRitual";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ProductCareAccordion } from "@/components/marketing/ProductCareAccordion";
import { getUnitWeightOz } from "@/lib/product-weight";
import { inferProductVariantMeta } from "@/lib/product-variants";
import { buildProductMetadata, buildProductJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Category } from "@prisma/client";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product" };
  return buildProductMetadata(product);
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const variantMeta = inferProductVariantMeta(product);
  const { variants: scentVariants } = await getProductScentVariants(product);
  const selectedScentLabel =
    variantMeta?.label ??
    product.fragrance ??
    product.name;
  const gradient = getCategoryGradient(product.category);
  const weightOz = getUnitWeightOz(
    product.category,
    product.name,
    product.slug,
    product.weightOz
  );

  return (
    <section className="marketing-header-offset min-h-screen bg-cream px-4 pb-24 sm:px-6">
      <JsonLd data={buildProductJsonLd(product)} />
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
        <ProductDetailGrid
          product={product}
          scentVariants={scentVariants}
          gradient={gradient}
          selectedScentLabel={selectedScentLabel}
          detailsBeforeScents={
            <>
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
            </>
          }
          detailsAfterScents={
            <>
              {product.fragrance && scentVariants.length === 0 && (
                <p className="mb-4">
                  <span className="label-caps text-muted">Fragrance · </span>
                  <span className="text-green">{product.fragrance}</span>
                </p>
              )}
              <p className="mb-4">
                <span className="label-caps text-muted">Weight · </span>
                <span className="text-green">{weightOz} oz</span>
              </p>
              {product.ingredients && (
                <div className="mb-8">
                  <p className="label-caps text-muted mb-2">Ingredients</p>
                  <p className="text-sm text-muted leading-relaxed">
                    {product.ingredients}
                  </p>
                </div>
              )}
              <ProductDetailPurchaseActions />
              <ProductCareAccordion category={product.category as Category} />
            </>
          }
        />
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
    BAR_SOAP: "linear-gradient(135deg, #3D6454, #2C4A3E)",
    BODY_WASH: "linear-gradient(135deg, #2C4A3E, #1a2e26)",
    BATH_BODY: "linear-gradient(135deg, #2C4A3E, #1a2e26)",
    CANDLES: "linear-gradient(135deg, #B5552A, #8C3F1E)",
    ACCESSORIES: "linear-gradient(135deg, #4a6741, #2C4A3E)",
    LOTION: "linear-gradient(135deg, #C9A96E, #B5552A)",
    SCRUB: "linear-gradient(135deg, #6B5E52, #3D6454)",
    AROMATHERAPY: "linear-gradient(135deg, #1a2e26, #2C4A3E)",
    GIFT_SET: "linear-gradient(135deg, #B5552A, #8C3F1E)",
  };
  return gradients[category] || gradients.BAR_SOAP;
}
