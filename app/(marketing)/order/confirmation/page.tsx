import { Suspense } from "react";
import OrderConfirmationPage from "@/components/marketing/OrderConfirmationPage";
import { brandTitle } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("/order/confirmation", {
  title: brandTitle("Order Confirmed"),
  robots: { index: false, follow: false },
});

export default function OrderConfirmationRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream pt-32" />}>
      <OrderConfirmationPage />
    </Suspense>
  );
}
