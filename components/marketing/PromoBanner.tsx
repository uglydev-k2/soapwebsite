"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { FREE_SAMPLE_PROMO, FREE_SHIPPING_PROMO } from "@/lib/shipping";
import {
  syncPromoHeight,
  usePromoBannerStore,
} from "@/store/promoBannerStore";

export function PromoBanner() {
  const { visible, ready, init, dismiss } = usePromoBannerStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!ready) return;
    syncPromoHeight(visible);
  }, [visible, ready]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[51] bg-terra px-4 py-2.5 text-center md:static md:z-auto md:hidden">
      <p className="mx-auto max-w-md text-[11px] leading-snug text-white sm:text-xs">
        <span className="block sm:inline">{FREE_SHIPPING_PROMO}</span>
        <span className="hidden sm:inline"> · </span>
        <span className="block sm:inline">{FREE_SAMPLE_PROMO}</span>
        <span className="hidden sm:inline"> · </span>
        <Link
          href="/collections"
          className="mt-1 inline-block underline underline-offset-2 hover:text-cream sm:mt-0"
        >
          Shop now
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="touch-target absolute right-1 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
        aria-label="Dismiss promotion"
      >
        <X size={16} />
      </button>
    </div>
  );
}
