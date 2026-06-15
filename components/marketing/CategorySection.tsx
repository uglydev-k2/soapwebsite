import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AmbientOrbs } from "@/components/motion/ScrollParallax";
import {
  AnimatedSectionHeader,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/ScrollReveal";
import { SHOP_CATEGORY_MENU } from "@/lib/categories";

export default function CategorySection() {
  return (
    <section
      className="relative overflow-hidden bg-white py-14 sm:py-20 lg:py-28"
      id="shop-categories"
    >
      <AmbientOrbs />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSectionHeader
          eyebrow="New Categories"
          title="Shop by Collection"
          description="Browse our lineup — from everyday bar soaps to gift-ready sets."
          align="left"
          className="max-w-xl"
        />

        <StaggerContainer className="mt-10 max-w-xl" stagger={0.05}>
          <div className="border border-green/15 bg-cream/30 px-5 py-2 sm:px-6">
            {SHOP_CATEGORY_MENU.map((category) => (
              <StaggerItem key={category.slug}>
                <Link
                  href={`/collections/category/${category.slug}`}
                  className="group flex min-h-[3.25rem] items-center justify-between gap-4 border-b border-green/10 py-4 transition-colors last:border-b-0 hover:text-terra sm:min-h-[3.5rem] sm:py-5"
                >
                  <span className="font-serif text-xl text-green transition-colors group-hover:text-terra sm:text-2xl">
                    {category.label}
                  </span>
                  <ChevronRight
                    size={20}
                    className="shrink-0 text-green/30 transition-transform group-hover:translate-x-0.5 group-hover:text-terra"
                    aria-hidden
                  />
                </Link>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <StaggerContainer className="mt-10 max-w-xl" stagger={0.05}>
          <StaggerItem>
            <Link
              href="/#reviews"
              className="group inline-flex min-h-[3.25rem] items-center gap-3 font-serif text-xl text-green transition-colors hover:text-terra sm:text-2xl"
            >
              <span>Reviews</span>
              <ChevronRight
                size={20}
                className="text-green/30 transition-transform group-hover:translate-x-0.5 group-hover:text-terra"
                aria-hidden
              />
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
