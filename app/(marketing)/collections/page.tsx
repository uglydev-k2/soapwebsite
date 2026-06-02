export const dynamic = "force-dynamic";

import { getActiveProducts } from "@/lib/products";
import ProductCard from "@/components/marketing/ProductCard";
import { Suspense } from "react";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  AnimatedSectionHeader,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/ScrollReveal";
import type { Category } from "@prisma/client";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { RecentlyViewedSection } from "@/components/marketing/RecentlyViewedSection";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";

export const metadata = {
  title: "Collections — MsVee Soaps",
};

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

async function CollectionsList({
  category,
  scent,
  sort,
  q,
}: {
  category?: Category;
  scent?: string;
  sort: SortValue;
  q?: string;
}) {
  const products = await getActiveProducts({ category, scent, sort, q });

  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="mb-2 font-serif text-2xl text-green">
          Our collection is growing
        </p>
        <p className="text-muted">Check back soon for new botanical rituals.</p>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid [grid-template-columns:repeat(2,minmax(0,1fr))] gap-3 sm:gap-6 lg:[grid-template-columns:repeat(3,minmax(0,1fr))]">
      {products.map((product, index) => (
        <StaggerItem key={product.id} className="h-full min-w-0">
          <ProductCard product={product} index={index} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

export default function CollectionsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const categoryQuery = parseQueryValue(searchParams?.category);
  const category = PRODUCT_CATEGORIES.some((o) => o.value === categoryQuery)
    ? (categoryQuery as Category)
    : undefined;
  const scent = parseQueryValue(searchParams?.scent)?.trim() || undefined;
  const q = parseQueryValue(searchParams?.q)?.trim() || undefined;
  const sortQuery = parseQueryValue(searchParams?.sort);
  const sort = sortOptions.some((o) => o.value === sortQuery)
    ? (sortQuery as SortValue)
    : "featured";

  return (
    <section className="min-h-screen bg-cream px-6 pb-24 pt-32">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections" },
          ]}
        />
        <AnimatedSectionHeader
          eyebrow="Shop All"
          title="Our Collections"
          description="Hand-crafted botanical bath and body essentials, made in small batches with clean ingredients."
        />

        <form className="mt-10 grid gap-4 border border-green/10 bg-white p-5 sm:grid-cols-2 lg:grid-cols-5">
          <label className="space-y-2 sm:col-span-2 lg:col-span-2">
            <span className="label-caps text-muted">Search</span>
            <input
              name="q"
              placeholder="Search products…"
              defaultValue={q ?? ""}
              className="input-admin"
              style={{ borderRadius: "2px" }}
            />
          </label>
          <label className="space-y-2">
            <span className="label-caps text-muted">Category</span>
            <select
              name="category"
              defaultValue={category ?? ""}
              className="input-admin"
              style={{ borderRadius: "2px" }}
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="label-caps text-muted">Scent</span>
            <input
              name="scent"
              placeholder="e.g. Cedar, Amber"
              defaultValue={scent ?? ""}
              className="input-admin"
              style={{ borderRadius: "2px" }}
            />
          </label>

          <label className="space-y-2">
            <span className="label-caps text-muted">Sort</span>
            <select
              name="sort"
              defaultValue={sort}
              className="input-admin"
              style={{ borderRadius: "2px" }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-3">
            <Button type="submit" variant="primary" className="w-full">
              Apply
            </Button>
            <Link
              href="/collections"
              className="inline-flex w-full items-center justify-center border border-green/20 px-6 py-3 text-sm text-text transition-colors duration-250 hover:border-green"
              style={{ borderRadius: 0 }}
            >
              Reset
            </Link>
          </div>
        </form>
        <Suspense
          fallback={
            <div className="mt-16 grid [grid-template-columns:repeat(2,minmax(0,1fr))] gap-3 sm:gap-6 lg:[grid-template-columns:repeat(3,minmax(0,1fr))]">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          }
        >
          <div className="mt-16">
            <CollectionsList category={category} scent={scent} sort={sort} q={q} />
          </div>
        </Suspense>
        <RecentlyViewedSection />
      </div>
    </section>
  );
}
