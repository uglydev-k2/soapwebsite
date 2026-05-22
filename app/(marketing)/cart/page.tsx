"use client";

import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const shipping = subtotal() >= 75 ? 0 : 8;
  const tax = subtotal() * 0.08;
  const total = subtotal() + shipping + tax;

  const checkout = async () => {
    if (!email || !firstName) {
      addToast("Please fill in your details", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email, firstName, lastName }),
      });
      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        addToast(data.error || "Checkout failed", "error");
      }
    } catch {
      addToast("Checkout failed", "error");
    }
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <section className="pt-32 pb-24 px-6 min-h-screen text-center">
        <h1 className="font-serif text-3xl text-green mb-4">Your cart is empty</h1>
        <p className="text-muted mb-8">Discover our botanical collection.</p>
        <Link href="/collections">
          <Button>Explore Collection</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl font-light text-green mb-12">Your Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-6 card-border p-4 bg-white">
                <div
                  className="w-20 h-20 flex-shrink-0 bg-green/10"
                  style={{ background: "linear-gradient(135deg, var(--green-2), var(--green))" }}
                />
                <div className="flex-1">
                  <Link
                    href={`/collections/${item.slug}`}
                    className="font-serif text-lg text-green hover:text-terra"
                  >
                    {item.name}
                  </Link>
                  <p className="text-muted text-sm mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="text-muted hover:text-green"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="text-muted hover:text-green"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto text-muted hover:text-terra"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="font-serif text-green">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="card-border p-6 bg-white h-fit">
            <h2 className="label-caps text-muted mb-6">Order Summary</h2>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-serif text-lg text-green pt-2 border-t border-green/10">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <Input
                label="Email"
                variant="marketing"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="First Name"
                variant="marketing"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Last Name"
                variant="marketing"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={checkout} disabled={loading}>
              {loading ? "Processing..." : "Checkout with Stripe"}
            </Button>
            <button
              onClick={clearCart}
              className="w-full mt-3 text-xs text-muted hover:text-terra label-caps"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
