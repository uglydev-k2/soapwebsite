import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "./ProductCard";
import type { ProductWithMeta } from "@/types";

interface ProductGridProps {
  products?: ProductWithMeta[];
  limit?: number;
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export default async function ProductGrid({
  products,
  limit = 4,
  title = "Featured Collection",
  subtitle = "Curated Favorites",
  showViewAll = true,
}: ProductGridProps) {
  let items: ProductWithMeta[] = products ?? [];

  if (!products) {
    try {
      items = await getFeaturedProducts(limit);
    } catch (error) {
      console.error("[msvee] ProductGrid failed:", error);
      items = [];
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-20 lg:py-28" id="collections">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="label-caps text-terra">{subtitle}</span>
            <h2 className="mt-3 font-serif text-4xl font-light text-green lg:text-5xl">
              {title}
            </h2>
          </div>
          {showViewAll && (
            <Link
              href="/collections"
              className="label-caps text-green transition-colors hover:text-terra"
            >
              View All →
            </Link>
          )}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
