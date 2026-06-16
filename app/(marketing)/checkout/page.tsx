import { Suspense } from "react";
import CheckoutPageClient from "@/components/marketing/CheckoutPageClient";

export const metadata = {
  title: "Checkout — mvlusciouslather",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream pt-32" />}>
      <CheckoutPageClient />
    </Suspense>
  );
}
