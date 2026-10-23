import { MarketingPage } from "@/components/marketing/MarketingPage";
import { WishlistPageClient } from "@/components/marketing/WishlistPageClient";
import { brandTitle } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("/wishlist", {
  title: brandTitle("Wishlist"),
  description: "Products you've saved for later.",
  robots: { index: false, follow: false },
});

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
