export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/marketing/ProductCard";
import { Suspense } from "react";
import { CardSkeleton } from "@/components/ui/Skeleton";

export const metadata = {
  title: "Collections — MsVee Soaps",
};

async function CollectionsList() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-serif text-2xl text-green mb-2">Our collection is growing</p>
        <p className="text-muted">Check back soon for new botanical rituals.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <section className="pt-32 pb-24 px-6 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="label-caps text-terra mb-4">Shop All</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-green tracking-wide">
            Our Collections
          </h1>
          <p className="text-muted mt-4 max-w-lg mx-auto">
            Hand-crafted botanical bath and body essentials, made in small batches with clean ingredients.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          }
        >
          <CollectionsList />
        </Suspense>
      </div>
    </section>
  );
}
