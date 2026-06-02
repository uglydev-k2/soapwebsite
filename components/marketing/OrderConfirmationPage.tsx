"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { formatDate, formatPrice } from "@/lib/utils";
import type { ApiResponse } from "@/types";

type ConfirmationOrder = {
  orderNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
  items: {
    name: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }[];
  createdAt: string;
};

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((s) => s.clearCart);
  const [order, setOrder] = useState<ConfirmationOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("Missing payment session.");
      setLoading(false);
      return;
    }

    let attempts = 0;
    const load = async () => {
      attempts += 1;
      try {
        const res = await fetch(
          `/api/orders/confirmation?session_id=${encodeURIComponent(sessionId)}`
        );
        const json = (await res.json()) as ApiResponse<ConfirmationOrder>;
        if (res.ok && json.data) {
          setOrder(json.data);
          clearCart();
          setLoading(false);
          return;
        }
        if (attempts < 8) {
          setTimeout(load, 1500);
          return;
        }
        setError(json.error || "We could not find your order yet.");
      } catch {
        setError("Unable to load order confirmation.");
      }
      setLoading(false);
    };

    load();
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <section className="pt-32 pb-24 px-6 min-h-screen text-center">
        <p className="text-muted">Confirming your order…</p>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="pt-32 pb-24 px-6 min-h-screen text-center">
        <h1 className="font-serif text-3xl text-green mb-4">Order processing</h1>
        <p className="text-muted mb-8 max-w-md mx-auto">{error}</p>
        <Link href="/collections">
          <Button>Continue Shopping</Button>
        </Link>
      </section>
    );
  }

  const address = order.shippingAddress;

  return (
    <section className="pt-32 pb-24 px-6 min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto">
        <p className="label-caps text-terra mb-3">Order confirmed</p>
        <h1 className="font-serif text-4xl font-medium text-green mb-4">
          Thank you, {order.firstName}!
        </h1>
        <p className="text-muted mb-10">
          Order <strong className="text-green">{order.orderNumber}</strong> was placed on{" "}
          {formatDate(order.createdAt)}. A confirmation email was sent to {order.email}.
        </p>

        <div className="card-border bg-white p-6 mb-6">
          <h2 className="font-serif text-2xl text-green mb-4">Items</h2>
          <ul className="space-y-3 text-sm">
            {order.items.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex justify-between gap-4">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 text-sm border-t border-green/10 pt-4">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-serif text-lg text-green">
              <span>Total paid</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {address && (
          <div className="card-border bg-white p-6 mb-8">
            <h2 className="font-serif text-2xl text-green mb-4">Shipping to</h2>
            <p className="text-sm text-muted leading-relaxed">
              {order.firstName} {order.lastName}
              <br />
              {address.line1}
              {address.line2 ? (
                <>
                  <br />
                  {address.line2}
                </>
              ) : null}
              <br />
              {address.city}, {address.state} {address.postalCode}
              <br />
              {address.country}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/collections">
            <Button>Continue Shopping</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">View Dashboard</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
