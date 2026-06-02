"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  priceLabel: string;
  fragrance: string | null;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        const json = await res.json();
        setResults(json.data?.products ?? json.products ?? []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="touch-target flex items-center justify-center text-green transition-colors duration-250 hover:text-terra"
        aria-label="Search products"
      >
        <Search size={20} strokeWidth={1.5} />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-[100] bg-green-3/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <div
        className={cn(
          "fixed inset-x-3 top-[7.25rem] z-[110] mx-auto max-w-xl border border-green/10 bg-white shadow-2xl transition-all duration-300 sm:inset-x-4 sm:top-28 md:inset-x-auto md:left-1/2 md:-translate-x-1/2",
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
      >
        <div className="flex items-center gap-3 border-b border-green/10 px-4 py-3">
          <Search size={18} className="text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search soaps, scents, gifts…"
            className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted hover:text-green"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[min(20rem,55vh)] overflow-y-auto p-2 sm:max-h-80">
          {query.trim().length < 2 && (
            <p className="px-3 py-6 text-center text-sm text-muted">
              Type at least 2 characters to search
            </p>
          )}
          {query.trim().length >= 2 && loading && (
            <p className="px-3 py-6 text-center text-sm text-muted">Searching…</p>
          )}
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">No products found</p>
          )}
          <ul>
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/collections/${product.slug}`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-3 transition-colors hover:bg-cream"
                >
                  <span className="font-serif text-green">{product.name}</span>
                  {product.fragrance && (
                    <span className="mt-0.5 block text-xs text-muted">
                      {product.fragrance}
                    </span>
                  )}
                  <span className="mt-1 block text-sm text-terra">
                    {product.priceLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {query.trim().length >= 2 && !loading && (
            <Link
              href={`/collections?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setOpen(false)}
              className="block border-t border-green/10 px-3 py-4 text-center label-caps text-green hover:text-terra"
            >
              View all results →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
