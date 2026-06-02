import Link from "next/link";
import {
  InteractiveCard,
  InteractiveMedia,
} from "@/components/motion/InteractiveCard";
import { AmbientOrbs } from "@/components/motion/ScrollParallax";
import {
  AnimatedSectionHeader,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/ScrollReveal";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { getCategoryGradient } from "@/lib/utils";

export default function CategorySection() {
  return (
    <section className="relative overflow-hidden bg-white py-14 sm:py-20 lg:py-28" id="shop-categories">
      <AmbientOrbs />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSectionHeader
          eyebrow="Shop by Category"
          title="Find Your Perfect Ritual"
          description="Browse our collections by product type — from daily bar soaps to gift-ready sets."
        />

        <StaggerContainer
          className="mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3"
          stagger={0.06}
        >
          {PRODUCT_CATEGORIES.map((category) => (
            <StaggerItem key={category.value}>
              <InteractiveCard>
                <Link
                  href={`/collections/category/${category.slug}`}
                  className="group block h-full overflow-hidden border border-green/10 bg-white transition-colors duration-250 hover:border-terra/35 hover:shadow-md"
                  style={{ borderRadius: "2px" }}
                >
                  <InteractiveMedia
                    className={`aspect-[4/3] bg-gradient-to-br ${getCategoryGradient(category.value)}`}
                  >
                    <span className="sr-only">{category.label}</span>
                  </InteractiveMedia>
                  <div className="p-5 sm:p-6">
                    <h3 className="font-serif text-xl text-green transition-colors duration-250 group-hover:text-terra sm:text-2xl">
                      {category.label}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {category.description}
                    </p>
                    <span className="mt-4 inline-block label-caps text-green transition-transform duration-250 group-hover:translate-x-1 group-hover:text-terra">
                      Shop {category.label} →
                    </span>
                  </div>
                </Link>
              </InteractiveCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
