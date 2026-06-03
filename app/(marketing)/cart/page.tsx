"use client";

import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { calculateCartTotals } from "@/lib/shipping";
import { FreeShippingProgress } from "@/components/marketing/FreeShippingProgress";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();

  const sub = subtotal();
  const { shipping, tax, total } = calculateCartTotals(sub);

  if (items.length === 0) {
    return (
      <section className="marketing-header-offset min-h-screen px-4 pb-24 text-center sm:px-6">
        <h1 className="font-serif text-3xl text-green mb-4">Your cart is empty</h1>
        <p className="text-muted mb-8">Discover our botanical collection.</p>
        <Link href="/collections">
          <Button>Explore Collection</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="marketing-header-offset min-h-screen px-4 pb-24 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl font-semibold text-green mb-12">Your Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-6 card-border p-4 bg-white">
                <div
                  className="w-20 h-20 flex-shrink-0 overflow-hidden"
                  style={{
                    background: item.image
                      ? undefined
                      : "linear-gradient(135deg, var(--green-2), var(--green))",
                  }}
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
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
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="text-muted hover:text-green"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="text-muted hover:text-green"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto text-muted hover:text-terra"
                      aria-label="Remove item"
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
            <div className="mb-6">
              <FreeShippingProgress subtotal={sub} />
            </div>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(sub)}</span>
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
            <Link href="/checkout">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
            <Link
              href="/collections"
              className="mt-3 block text-center text-xs text-muted hover:text-terra label-caps"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
