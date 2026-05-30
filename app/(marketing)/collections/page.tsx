export const dynamic = "force-dynamic";

import { getActiveProducts } from "@/lib/products";
import ProductCard from "@/components/marketing/ProductCard";
import { Suspense } from "react";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
  AnimatedSectionHeader,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/ScrollReveal";

export const metadata = {
  title: "Collections — MsVee Soaps",
};

async function CollectionsList() {
  const products = await getActiveProducts();

  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="mb-2 font-serif text-2xl text-green">
          Our collection is growing
        </p>
        <p className="text-muted">Check back soon for new botanical rituals.</p>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} index={index} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

export default function CollectionsPage() {
  return (
    <section className="min-h-screen bg-cream px-6 pb-24 pt-32">
      <div className="mx-auto max-w-6xl">
        <AnimatedSectionHeader
          eyebrow="Shop All"
          title="Our Collections"
          description="Hand-crafted botanical bath and body essentials, made in small batches with clean ingredients."
        />
        <Suspense
          fallback={
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          }
        >
          <div className="mt-16">
            <CollectionsList />
          </div>
        </Suspense>
      </div>
    </section>
  );
}
