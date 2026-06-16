import { Suspense } from "react";
import OrderConfirmationPage from "@/components/marketing/OrderConfirmationPage";

export const metadata = {
  title: "Order Confirmed — mvlusciouslather",
};

export default function OrderConfirmationRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream pt-32" />}>
      <OrderConfirmationPage />
    </Suspense>
  );
}
