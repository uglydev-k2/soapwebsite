import { MarketingPage } from "@/components/marketing/MarketingPage";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";
import { FAQ_ITEMS } from "@/lib/content/site-content";

export const metadata = { title: "FAQ — MsVee Soaps" };

export default function FAQPage() {
  return (
    <MarketingPage
      eyebrow="Support"
      title="Frequently Asked Questions"
      description="Everything you need to know about orders, ingredients, shipping, and returns."
    >
      <FAQAccordion items={FAQ_ITEMS} />
    </MarketingPage>
  );
}
