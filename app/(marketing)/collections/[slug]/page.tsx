export const dynamic = "force-dynamic";

import { getProductBySlug } from "@/lib/products";
import { notFound } from "next/navigation";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import ProductBundleSelector from "@/components/marketing/ProductBundleSelector";
import ProductGallery from "@/components/marketing/ProductGallery";
import ProductReviews from "@/components/marketing/ProductReviews";
import Link from "next/link";

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
      <div className="max-w-6xl mx-auto">
        <Link
          href="/collections"
          className="label-caps text-muted hover:text-green transition-colors mb-8 inline-block"
        >
          ← Back to Collections
        </Link>
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
            <p className="label-caps text-muted mb-6">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
            <ProductBundleSelector product={product} disabled={product.stock === 0} />
          </div>
        </div>
        <ProductReviews slug={product.slug} />
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
