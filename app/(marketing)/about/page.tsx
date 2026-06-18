import { MarketingPage } from "@/components/marketing/MarketingPage";
import { AboutStory } from "@/components/marketing/AboutStory";
import { brandTitle } from "@/lib/brand";

export const metadata = {
  title: brandTitle("About"),
  description:
    "Discover how MV Luscious Lather handcrafts small-batch botanical soaps, scrubs, and bath rituals — from sourcing to pour, cure, and pack.",
};

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="About Us"
      title="Crafted with Intention"
      description="A closer look at who we are, how we make our products, and why every batch is poured by hand."
      wide
    >
      <AboutStory />
    </MarketingPage>
  );
}
