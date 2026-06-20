"use client";

import { create } from "zustand";

export const PROMO_BANNER_STORAGE_KEY = "msvee-promo-dismissed";

interface PromoBannerState {
  visible: boolean;
  ready: boolean;
  init: () => void;
  dismiss: () => void;
}

export const usePromoBannerStore = create<PromoBannerState>((set) => ({
  visible: false,
  ready: false,
  init: () => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(PROMO_BANNER_STORAGE_KEY) === "1";
    set({ visible: !dismissed, ready: true });
  },
  dismiss: () => {
    localStorage.setItem(PROMO_BANNER_STORAGE_KEY, "1");
    set({ visible: false });
  },
}));

export function syncPromoHeight(visible: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    "--marketing-promo-h",
    visible ? "2.75rem" : "0px"
  );
}

export function syncNavHeight(hidden: boolean, isDesktop: boolean) {
  if (typeof document === "undefined") return;
  if (isDesktop) {
    document.documentElement.style.setProperty("--marketing-nav-h", "5.5rem");
    return;
  }
  document.documentElement.style.setProperty(
    "--marketing-nav-h",
    hidden ? "0px" : "4rem"
  );
}
