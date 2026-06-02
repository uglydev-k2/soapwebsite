"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "msvee-promo-dismissed";

export function PromoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative bg-terra px-6 py-2.5 text-center text-xs text-white sm:text-sm">
      <p>
        Free shipping on orders $75+ ·{" "}
        <Link href="/gift-guide" className="underline underline-offset-2 hover:text-cream">
          Shop the gift guide
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
