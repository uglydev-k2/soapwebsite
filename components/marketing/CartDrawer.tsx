"use client";

import Link from "next/link";
import { X, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import {
  calculateCartTotals,
} from "@/lib/shipping";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FreeShippingProgress } from "@/components/marketing/FreeShippingProgress";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();

  const sub = subtotal();
  const { total } = calculateCartTotals(sub);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[80] bg-black/40 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-green/10 px-6 py-5">
          <h2 className="font-serif text-2xl text-green">Your Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-green"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-muted text-center py-12">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-4 border-b border-green/10 pb-4"
                >
                  <div className="flex-1">
                    <Link
                      href={`/collections/${item.slug}`}
                      onClick={onClose}
                      className="font-serif text-green hover:text-terra"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="text-muted hover:text-green"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="text-muted hover:text-green"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="ml-2 text-xs text-terra hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="font-serif text-green">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-green/10 px-6 py-5 space-y-3">
            <FreeShippingProgress subtotal={sub} />
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(sub)}</span>
            </div>
            <div className="flex justify-between font-serif text-lg text-green">
              <span>Estimated total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link href="/cart" onClick={onClose}>
              <Button variant="ghost" className="w-full">
                View Full Cart
              </Button>
            </Link>
            <Link href="/checkout" onClick={onClose}>
              <Button className="w-full">Checkout</Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
