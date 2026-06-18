import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";
import { getBundleLineTotal } from "@/lib/bundle-pricing";

function matchesCartLine(
  item: CartItem,
  productId: string,
  scentOptionId?: string
) {
  return (
    item.productId === productId &&
    (item.scentOptionId ?? undefined) === (scentOptionId ?? undefined)
  );
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, scentOptionId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    scentOptionId?: string
  ) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) =>
            matchesCartLine(i, item.productId, item.scentOptionId)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                matchesCartLine(i, item.productId, item.scentOptionId)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },
      removeItem: (productId, scentOptionId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !matchesCartLine(i, productId, scentOptionId)
          ),
        })),
      updateQuantity: (productId, quantity, scentOptionId) => {
        if (quantity <= 0) {
          get().removeItem(productId, scentOptionId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            matchesCartLine(i, productId, scentOptionId)
              ? { ...i, quantity }
              : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + getBundleLineTotal(i.price, i.quantity),
          0
        ),
    }),
    { name: "msvee-cart" }
  )
);
