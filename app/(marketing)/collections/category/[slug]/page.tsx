export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getActiveProducts } from "@/lib/products";
import { getShopCategoryBySlug } from "@/lib/categories";
import ProductCard from "@/components/marketing/ProductCard";
import {
  AnimatedSectionHeader,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/ScrollReveal";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const category = getShopCategoryBySlug(params.slug);
  if (!category) return { title: "Category — mvlusciouslather" };
  return {
    title: `${category.label} — mvlusciouslather`,
    description: category.description,
  };
}

export default async function CategoryCollectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = getShopCategoryBySlug(params.slug);
  if (!category) notFound();

  const products =
    category.values.length > 0
      ? await getActiveProducts({
          categories: category.values,
          sort: "featured",
        })
      : [];

  return (
    <section className="marketing-header-offset min-h-screen bg-cream px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/collections"
          className="label-caps mb-8 inline-block text-muted transition-colors hover:text-green"
        >
          ← All Collections
        </Link>

        <AnimatedSectionHeader
          align="left"
          eyebrow="Product Category"
          title={category.label}
          description={category.description}
          className="max-w-2xl"
        />

        {products.length === 0 ? (
          <div className="mt-16 py-16 text-center">
            <p className="font-serif text-2xl text-green">Coming soon</p>
            <p className="mt-2 text-muted">
              We&apos;re crafting new {category.label.toLowerCase()} for this
              collection.
            </p>
            <Link
              href="/collections"
              className="mt-6 inline-block label-caps text-terra hover:text-green"
            >
              Browse all products →
            </Link>
          </div>
        ) : (
          <StaggerContainer className="mt-12 grid [grid-template-columns:repeat(2,minmax(0,1fr))] gap-3 sm:gap-6 lg:[grid-template-columns:repeat(3,minmax(0,1fr))]">
            {products.map((product, index) => (
              <StaggerItem key={product.id} className="h-full min-w-0">
                <ProductCard product={product} index={index} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
