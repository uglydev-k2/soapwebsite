"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistItem } from "@/store/wishlistStore";

interface RecentlyViewedState {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
}

const MAX_ITEMS = 6;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const filtered = get().items.filter((i) => i.productId !== item.productId);
        set({ items: [item, ...filtered].slice(0, MAX_ITEMS) });
      },
    }),
    { name: "msvee-recently-viewed" }
  )
);
