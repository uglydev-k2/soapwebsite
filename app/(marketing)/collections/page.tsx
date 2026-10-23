export const dynamic = "force-dynamic";

import { getCatalogProducts } from "@/lib/products";
import ProductCard from "@/components/marketing/ProductCard";
import {
  AnimatedSectionHeader,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/ScrollReveal";
import { CollectionsFilters } from "@/components/marketing/CollectionsFilters";
import type { Category } from "@prisma/client";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { RecentlyViewedSection } from "@/components/marketing/RecentlyViewedSection";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import {
  parseSkinConcern,
  SKIN_CONCERN_DEFINITIONS,
} from "@/lib/skin-concerns";
import { brandTitle } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";
import { SubscribeCheckoutIntent } from "@/components/marketing/SubscribeCheckoutIntent";
import type { SubscriptionCadence } from "@/lib/subscriptions";

export const metadata = buildPageMetadata("/collections", {
  title: brandTitle("Collections"),
  description:
    "Shop handcrafted botanical soaps, body washes, lotions, scrubs, and gift sets — made in small batches with clean ingredients.",
});

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name (A-Z)" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

function parseQueryValue(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const categoryQuery = parseQueryValue(searchParams?.category);
  const category = PRODUCT_CATEGORIES.some((o) => o.value === categoryQuery)
    ? (categoryQuery as Category)
    : undefined;
  const scent = parseQueryValue(searchParams?.scent)?.trim() || undefined;
  const concern = parseSkinConcern(parseQueryValue(searchParams?.concern));
  const q = parseQueryValue(searchParams?.q)?.trim() || undefined;
  const sortQuery = parseQueryValue(searchParams?.sort);
  const sort = sortOptions.some((o) => o.value === sortQuery)
    ? (sortQuery as SortValue)
    : "featured";
  const products = await getCatalogProducts({ category, scent, concern, sort, q });
  const subscribeQuery = parseQueryValue(searchParams?.subscribe);
  let subscribeCadence: SubscriptionCadence | undefined =
    subscribeQuery === "monthly" ||
    subscribeQuery === "bimonthly" ||
    subscribeQuery === "quarterly"
      ? subscribeQuery
      : undefined;
  // Product slug links (e.g. ?subscribe=balsam-cedarwood) default to monthly subscribe at checkout.
  if (!subscribeCadence && subscribeQuery) {
    const slugMatch = products.some((p) => p.slug === subscribeQuery);
    if (slugMatch) subscribeCadence = "monthly";
  }

  return (
    <section className="marketing-header-offset min-h-screen bg-cream px-4 pb-24 sm:px-6">
      {subscribeCadence ? (
        <SubscribeCheckoutIntent cadence={subscribeCadence} />
      ) : null}
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections" },
          ]}
        />
        <AnimatedSectionHeader
          headingLevel="h1"
          eyebrow="Shop All"
          title={
            concern ? SKIN_CONCERN_DEFINITIONS[concern].label : "Our Collections"
          }
          description={
            concern
              ? (SKIN_CONCERN_DEFINITIONS[concern].description ??
                "Curated picks for this skin concern.")
              : "Hand-crafted botanical bath and body essentials, made in small batches with clean ingredients."
          }
        />

        <CollectionsFilters
          category={category}
          scent={scent}
          concern={concern}
          sort={sort}
          q={q}
          resultCount={products.length}
        />

        <div className="mt-16">
          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="mb-2 font-serif text-2xl text-green">
                No rituals match these filters
              </p>
              <p className="text-muted">
                Try a different scent or category, or clear filters to browse everything.
              </p>
            </div>
          ) : (
            <StaggerContainer className="grid [grid-template-columns:repeat(2,minmax(0,1fr))] gap-4 sm:gap-6 lg:[grid-template-columns:repeat(3,minmax(0,1fr))]">
              {products.map((product, index) => (
                <StaggerItem key={product.id} className="h-full min-w-0">
                  <ProductCard
                    product={product}
                    index={index}
                    scentVariants={product.scentVariants}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
        <RecentlyViewedSection />
      </div>
    </section>
  );
}
