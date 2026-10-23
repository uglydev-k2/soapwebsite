import { Suspense } from "react";
import CheckoutPageClient from "@/components/marketing/CheckoutPageClient";
import { brandTitle } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("/checkout", {
  title: brandTitle("Checkout"),
  robots: { index: false, follow: false },
});

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream pt-32" />}>
      <CheckoutPageClient />
    </Suspense>
  );
}
