import Hero from "@/components/marketing/Hero";
import Marquee from "@/components/marketing/Marquee";
import ValuesSection from "@/components/marketing/ValuesSection";
import ProductGrid from "@/components/marketing/ProductGrid";
import { ProductGridSkeleton } from "@/components/marketing/ProductGridSkeleton";
import RitualSection from "@/components/marketing/RitualSection";
import FragranceMap from "@/components/marketing/FragranceMap";
import Testimonials from "@/components/marketing/Testimonials";
import Newsletter from "@/components/marketing/Newsletter";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <ValuesSection />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
      <RitualSection />
      <FragranceMap />
      <Testimonials />
      <Newsletter />
    </>
  );
}
