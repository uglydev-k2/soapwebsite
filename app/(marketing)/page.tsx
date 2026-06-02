import Hero from "@/components/marketing/Hero";
import Marquee from "@/components/marketing/Marquee";
import QuickStatsBar from "@/components/marketing/QuickStatsBar";
import ValuesSection from "@/components/marketing/ValuesSection";
import CategorySection from "@/components/marketing/CategorySection";
import ScentFinder from "@/components/marketing/ScentFinder";
import RitualSection from "@/components/marketing/RitualSection";
import SkinConcernSection from "@/components/marketing/SkinConcernSection";
import SubscriptionSection from "@/components/marketing/SubscriptionSection";
import FragranceMap from "@/components/marketing/FragranceMap";
import TestimonialsCarousel from "@/components/marketing/TestimonialsCarousel";
import Newsletter from "@/components/marketing/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <QuickStatsBar />
      <ValuesSection />
      <CategorySection />
      <ScentFinder />
      <SkinConcernSection />
      <RitualSection />
      <SubscriptionSection />
      <FragranceMap />
      <TestimonialsCarousel />
      <Newsletter />
    </>
  );
}
