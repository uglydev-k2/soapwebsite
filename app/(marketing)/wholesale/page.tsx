import { MarketingPage } from "@/components/marketing/MarketingPage";
import { WholesaleForm } from "@/components/marketing/WholesaleForm";

export const metadata = { title: "Wholesale — MsVee Soaps" };

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
