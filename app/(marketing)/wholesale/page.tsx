import { MarketingPage } from "@/components/marketing/MarketingPage";
import { WholesaleForm } from "@/components/marketing/WholesaleForm";
import { brandTitle } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("/wholesale", {
  title: brandTitle("Wholesale"),
  description:
    "Boutiques, spas, and gift shops — partner with us for small-batch botanical care.",
});

export default function WholesalePage() {
  return (
    <MarketingPage
      eyebrow="Partnerships"
      title="Wholesale & Stockists"
      description="Boutiques, spas, and gift shops — partner with us for small-batch botanical care."
    >
      <WholesaleForm />
    </MarketingPage>
  );
}
