import { MarketingPage } from "@/components/marketing/MarketingPage";
import { WishlistPageClient } from "@/components/marketing/WishlistPageClient";

export const metadata = { title: "Wishlist — mvlusciouslather" };

export default function WishlistPage() {
  return (
    <MarketingPage
      eyebrow="Saved"
      title="Your Wishlist"
      description="Products you've saved for later."
    >
      <WishlistPageClient />
    </MarketingPage>
  );
}
