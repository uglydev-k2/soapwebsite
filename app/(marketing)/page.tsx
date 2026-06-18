import Hero from "@/components/marketing/Hero";
import Marquee from "@/components/marketing/Marquee";
import QuickStatsBar from "@/components/marketing/QuickStatsBar";
import ValuesSection from "@/components/marketing/ValuesSection";
import CategorySection from "@/components/marketing/CategorySection";
import ProductGrid from "@/components/marketing/ProductGrid";
import ScentFinder from "@/components/marketing/ScentFinder";
import TrustPressSection from "@/components/marketing/TrustPressSection";
import JournalPreviewSection from "@/components/marketing/JournalPreviewSection";
import RitualSection from "@/components/marketing/RitualSection";
import SkinConcernSection from "@/components/marketing/SkinConcernSection";
import SubscriptionSection from "@/components/marketing/SubscriptionSection";
import FragranceMap from "@/components/marketing/FragranceMap";
import TestimonialsCarousel from "@/components/marketing/TestimonialsCarousel";
import Newsletter from "@/components/marketing/Newsletter";
import { getProductsBySlugs } from "@/lib/products";

export default async function HomePage() {
  const ritualProducts = await getProductsBySlugs([
    "lavender-sage",
    "spearmint-eucalyptus",
    "oat-honey-comfort-bar",
    "full-ritual-gift-set",
  ]);

  return (
    <>
      <Hero />
      <Marquee />
      <QuickStatsBar />
      <ValuesSection />
      <CategorySection />
      <ProductGrid
        products={ritualProducts}
        title="Start Your Ritual"
        subtitle="Signature bar soaps"
        limit={4}
      />
      <TrustPressSection />
      <ScentFinder />
      <SkinConcernSection />
      <RitualSection />
      <SubscriptionSection />
      <FragranceMap />
      <JournalPreviewSection />
      <TestimonialsCarousel />
      <Newsletter />
    </>
  );
}
