export const dynamic = "force-dynamic";

import Hero from "@/components/marketing/Hero";
import Marquee from "@/components/marketing/Marquee";
import ValuesSection from "@/components/marketing/ValuesSection";
import ProductGrid from "@/components/marketing/ProductGrid";
import RitualSection from "@/components/marketing/RitualSection";
import FragranceMap from "@/components/marketing/FragranceMap";
import Testimonials from "@/components/marketing/Testimonials";
import Newsletter from "@/components/marketing/Newsletter";
import { Suspense } from "react";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <ValuesSection />
      <Suspense
        fallback={
          <section className="py-24 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </section>
        }
      >
        <ProductGrid />
      </Suspense>
      <RitualSection />
      <FragranceMap />
      <Testimonials />
      <Newsletter />
    </>
  );
}
