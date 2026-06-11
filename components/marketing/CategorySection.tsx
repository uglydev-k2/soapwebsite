import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AmbientOrbs } from "@/components/motion/ScrollParallax";
import { AnimatedSectionHeader } from "@/components/motion/ScrollReveal";
import { PRODUCT_CATEGORIES } from "@/lib/categories";

export default function CategorySection() {
  return (
    <section className="relative overflow-hidden bg-white py-14 sm:py-20 lg:py-28" id="shop-categories">
      <AmbientOrbs />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSectionHeader
          eyebrow="Shop by Category"
          title="New Categories"
          description="Explore our collections — from daily bar soaps to gift-ready sets."
          className="max-w-2xl"
        />

        <nav
          aria-label="Product categories"
          className="mx-auto mt-10 max-w-xl border border-green/10 bg-cream/30 sm:mt-12"
        >
          <ul className="divide-y divide-green/10">
            {PRODUCT_CATEGORIES.map((category) => (
              <li key={category.value}>
                <Link
                  href={`/collections/category/${category.slug}`}
                  className="group flex min-h-14 items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white sm:min-h-16 sm:px-6 sm:py-5"
                >
                  <span className="font-serif text-lg text-green transition-colors group-hover:text-terra sm:text-xl">
                    {category.label}
                  </span>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-green/30 transition-transform group-hover:translate-x-0.5 group-hover:text-terra"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mx-auto mt-8 max-w-xl text-center sm:mt-10">
          <Link
            href="#reviews"
            className="label-caps inline-flex min-h-11 items-center justify-center text-green transition-colors hover:text-terra"
          >
            Reviews
          </Link>
        </div>
      </div>
    </section>
  );
}
