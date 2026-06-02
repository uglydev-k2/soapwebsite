"use client";

import Link from "next/link";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { formatPrice } from "@/lib/utils";

interface RecentlyViewedStripProps {
  excludeSlug?: string;
}

export function RecentlyViewedStrip({ excludeSlug }: RecentlyViewedStripProps) {
  const items = useRecentlyViewedStore((s) => s.items).filter(
    (i) => i.slug !== excludeSlug
  );

  if (items.length === 0) return null;

  return (
    <section className="mt-20 border-t border-green/10 pt-16">
      <h2 className="font-serif text-2xl text-green">Recently Viewed</h2>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.slice(0, 6).map((item) => (
          <li key={item.productId}>
            <Link
              href={`/collections/${item.slug}`}
              className="block border border-green/10 bg-white p-4 transition-shadow hover:shadow-sm"
              style={{ borderRadius: "2px" }}
            >
              <p className="font-serif text-sm text-green line-clamp-2">{item.name}</p>
              <p className="mt-2 text-sm text-terra">{formatPrice(item.price)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
