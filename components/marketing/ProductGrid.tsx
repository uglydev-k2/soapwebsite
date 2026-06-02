import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "./ProductCard";
import { AnimatedSectionHeader, StaggerContainer, StaggerItem } from "@/components/motion/ScrollReveal";
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
          <AnimatedSectionHeader
            align="left"
            eyebrow={subtitle}
            title={title}
            className="max-w-xl"
          />
          {showViewAll && (
            <Link
              href="/collections"
              className="label-caps text-green transition-colors hover:text-terra"
            >
              View All →
            </Link>
          )}
        </div>

        <StaggerContainer
          className="mt-12 grid [grid-template-columns:repeat(2,minmax(0,1fr))] gap-3 sm:gap-6 lg:[grid-template-columns:repeat(4,minmax(0,1fr))]"
          stagger={0.06}
        >
          {items.map((product, index) => (
            <StaggerItem key={product.id} className="h-full min-w-0">
              <ProductCard product={product} index={index} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
