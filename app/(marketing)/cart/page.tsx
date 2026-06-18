"use client";

import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { getBundleLineTotal, getBundleDiscount } from "@/lib/bundle-pricing";
import { TAX_RATE } from "@/lib/shipping";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();

  const sub = subtotal();
  const estTax = Math.round(sub * TAX_RATE * 100) / 100;

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
              <div
                key={`${item.productId}:${item.scentOptionId ?? ""}`}
                className="flex gap-6 card-border p-4 bg-white"
              >
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
                  <p className="text-muted text-sm mt-1">
                    {formatPrice(item.price)} each
                    {getBundleDiscount(item.quantity) > 0 ? (
                      <span className="text-terra">
                        {" "}
                        · Save ${getBundleDiscount(item.quantity)}
                      </span>
                    ) : null}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity - 1,
                          item.scentOptionId
                        )
                      }
                      className="text-muted hover:text-green"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity + 1,
                          item.scentOptionId
                        )
                      }
                      className="text-muted hover:text-green"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.scentOptionId)}
                      className="ml-auto text-muted hover:text-terra"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="font-serif text-green">
                  {formatPrice(getBundleLineTotal(item.price, item.quantity))}
                </p>
              </div>
            ))}
          </div>
          <div className="card-border p-6 bg-white h-fit">
            <h2 className="label-caps text-muted mb-6">Order Summary</h2>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="text-muted text-right text-sm">
                  Calculated at checkout
                  <br />
                  <span className="text-xs">USPS · by weight & state</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Est. tax</span>
                <span>{formatPrice(estTax)}</span>
              </div>
              <p className="pt-2 text-xs text-muted">
                Shipping & final total calculated at checkout based on your state and order weight.
              </p>
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
