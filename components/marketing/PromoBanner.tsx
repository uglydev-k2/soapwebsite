"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { FREE_SAMPLE_PROMO, FREE_SHIPPING_PROMO } from "@/lib/shipping";

const STORAGE_KEY = "msvee-promo-dismissed";

export function PromoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[51] bg-terra px-10 py-2.5 text-center text-[11px] leading-snug text-white sm:text-sm md:static md:z-auto md:hidden">
      <p>
        {FREE_SHIPPING_PROMO} · {FREE_SAMPLE_PROMO} ·{" "}
        <Link href="/collections" className="underline underline-offset-2 hover:text-cream">
          Shop now
        </Link>
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, "1");
          setVisible(false);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/80 hover:text-white"
        aria-label="Dismiss promotion"
      >
        <X size={14} />
      </button>
    </div>
  );
}
