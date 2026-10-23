"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import type { Category } from "@prisma/client";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import {
  SKIN_CONCERN_DEFINITIONS,
  type SkinConcernId,
} from "@/lib/skin-concerns";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name (A-Z)" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

type CollectionsFiltersProps = {
  category?: Category;
  scent?: string;
  concern?: SkinConcernId;
  sort: SortValue;
  q?: string;
  resultCount: number;
};

function buildCollectionsPath(filters: {
  q?: string;
  category?: string;
  scent?: string;
  sort?: string;
  concern?: string;
}) {
  const params = new URLSearchParams();
  if (filters.concern?.trim()) params.set("concern", filters.concern.trim());
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.category?.trim()) params.set("category", filters.category.trim());
  if (filters.scent?.trim()) params.set("scent", filters.scent.trim());
  if (filters.sort?.trim() && filters.sort !== "featured") {
    params.set("sort", filters.sort.trim());
  }
  const query = params.toString();
  return query ? `/collections?${query}` : "/collections";
}

const fieldClass =
  "h-11 w-full border border-green/15 bg-cream/40 px-3 text-sm text-green outline-none transition-[border-color,box-shadow,background-color] duration-250 placeholder:text-muted/70 focus:border-terra/50 focus:bg-white focus:ring-2 focus:ring-terra/15";

export function CollectionsFilters({
  category,
  scent,
  concern,
  sort,
  q,
  resultCount,
}: CollectionsFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(q ?? "");
  const [scentQuery, setScentQuery] = useState(scent ?? "");

  useEffect(() => {
    setSearch(q ?? "");
  }, [q]);

  useEffect(() => {
    setScentQuery(scent ?? "");
  }, [scent]);

  const pushFilters = useCallback(
    (next: {
      q?: string;
      category?: string;
      scent?: string;
      sort?: string;
      concern?: string;
    }) => {
      startTransition(() => {
        router.push(buildCollectionsPath(next), { scroll: false });
      });
    },
    [router]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search === (q ?? "") && scentQuery === (scent ?? "")) return;
      pushFilters({
        q: search,
        category: category ?? "",
        scent: scentQuery,
        sort,
        concern: concern ?? "",
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, scentQuery, q, scent, category, sort, concern, pushFilters]);

  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];

    if (concern) {
      chips.push({
        key: "concern",
        label: SKIN_CONCERN_DEFINITIONS[concern].label,
        clear: () =>
          pushFilters({
            q: search,
            category: category ?? "",
            scent: scentQuery,
            sort,
          }),
      });
    }
    if (q?.trim()) {
      chips.push({
        key: "q",
        label: `"${q.trim()}"`,
        clear: () => {
          setSearch("");
          pushFilters({
            category: category ?? "",
            scent: scentQuery,
            sort,
            concern: concern ?? "",
          });
        },
      });
    }
    if (category) {
      const label =
        PRODUCT_CATEGORIES.find((c) => c.value === category)?.label ?? category;
      chips.push({
        key: "category",
        label,
        clear: () =>
          pushFilters({
            q: search,
            scent: scentQuery,
            sort,
            concern: concern ?? "",
          }),
      });
    }
    if (scent?.trim()) {
      chips.push({
        key: "scent",
        label: scent.trim(),
        clear: () => {
          setScentQuery("");
          pushFilters({
            q: search,
            category: category ?? "",
            sort,
            concern: concern ?? "",
          });
        },
      });
    }
    if (sort !== "featured") {
      const label = sortOptions.find((o) => o.value === sort)?.label ?? sort;
      chips.push({
        key: "sort",
        label,
        clear: () =>
          pushFilters({
            q: search,
            category: category ?? "",
            scent: scentQuery,
            sort: "featured",
            concern: concern ?? "",
          }),
      });
    }

    return chips;
  }, [
    concern,
    q,
    category,
    scent,
    sort,
    search,
    scentQuery,
    pushFilters,
  ]);

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div
      className={cn(
        "mt-10 overflow-hidden border border-green/10 bg-white shadow-[0_12px_40px_-24px_rgba(35,45,41,0.35)] transition-opacity duration-300",
        isPending && "opacity-80"
      )}
      style={{ borderRadius: "2px" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-green/8 bg-green/[0.03] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-green">
          <SlidersHorizontal size={15} className="text-terra" aria-hidden />
          <p className="label-caps text-muted">Refine collection</p>
        </div>
        <p className="text-sm text-muted">
          <span className="font-medium text-green">{resultCount}</span>{" "}
          {resultCount === 1 ? "ritual" : "rituals"}
          {isPending ? (
            <span className="ml-2 text-xs text-terra">Updating…</span>
          ) : null}
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-12 lg:gap-4">
        <label className="relative lg:col-span-5">
          <span className="sr-only">Search products</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search soaps, scrubs, gift sets…"
            className={cn(fieldClass, "pl-10")}
            style={{ borderRadius: "2px" }}
          />
        </label>

        <label className="space-y-1.5 lg:col-span-2">
          <span className="label-caps text-muted">Category</span>
          <select
            value={category ?? ""}
            onChange={(e) =>
              pushFilters({
                q: search,
                category: e.target.value,
                scent: scentQuery,
                sort,
                concern: concern ?? "",
              })
            }
            className={fieldClass}
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

        <label className="relative space-y-1.5 lg:col-span-3">
          <span className="label-caps text-muted">Scent</span>
          <Sparkles
            size={14}
            className="pointer-events-none absolute bottom-3 left-3 text-muted"
            aria-hidden
          />
          <input
            type="text"
            value={scentQuery}
            onChange={(e) => setScentQuery(e.target.value)}
            placeholder="Cedar, lavender, amber…"
            className={cn(fieldClass, "pl-9")}
            style={{ borderRadius: "2px" }}
          />
        </label>

        <label className="space-y-1.5 lg:col-span-2">
          <span className="label-caps text-muted">Sort</span>
          <select
            value={sort}
            onChange={(e) =>
              pushFilters({
                q: search,
                category: category ?? "",
                scent: scentQuery,
                sort: e.target.value,
                concern: concern ?? "",
              })
            }
            className={fieldClass}
            style={{ borderRadius: "2px" }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-green/8 px-4 py-3 sm:px-5">
          <span className="label-caps text-muted">Active</span>
          {activeFilters.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 border border-green/15 bg-cream/60 px-2.5 py-1 text-xs text-green transition-colors duration-250 hover:border-terra/40 hover:text-terra"
              style={{ borderRadius: "2px" }}
            >
              {chip.label}
              <X size={12} aria-hidden />
              <span className="sr-only">Remove {chip.label} filter</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setScentQuery("");
              startTransition(() => router.push("/collections", { scroll: false }));
            }}
            className="ml-auto text-xs text-terra transition-colors hover:text-green label-caps"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}
