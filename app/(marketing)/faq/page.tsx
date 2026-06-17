import { MarketingPage } from "@/components/marketing/MarketingPage";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";
import { getFaqItems } from "@/lib/content/site-content";
import { getPublicStoreSettings } from "@/lib/store-settings";

export const metadata = { title: "FAQ — mvlusciouslather" };

export default async function FAQPage() {
  const settings = await getPublicStoreSettings();

  return (
    <MarketingPage
      eyebrow="Support"
      title="Frequently Asked Questions"
      description="Everything you need to know about orders, ingredients, shipping, and returns."
    >
      <FAQAccordion items={getFaqItems(settings)} />
    </MarketingPage>
  );
}
