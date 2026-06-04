"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Command,
  Loader2,
  Package,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import type { ApiResponse } from "@/types";

type SearchResult = {
  type: "order" | "product" | "customer";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const typeIcons = {
  order: ShoppingCart,
  product: Package,
  customer: User,
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/search?q=${encodeURIComponent(q.trim())}`
      );
      const json = (await res.json()) as ApiResponse<SearchResult[]>;
      setResults(json.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, open, search]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const navigate = (href: string) => {
    onClose();
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-start sm:px-4 sm:pt-[12vh]">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex max-h-[min(92dvh,640px)] w-full flex-col overflow-hidden border border-green/10 bg-white shadow-2xl sm:max-h-[min(80vh,640px)] sm:max-w-xl sm:rounded-none">
        <div className="flex items-center gap-3 border-b border-green/10 px-4 py-3">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, products, customers…"
            className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted"
          />
          {loading && <Loader2 size={16} className="animate-spin text-muted" />}
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-green"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:max-h-[360px] sm:flex-none">
          {query.length < 2 ? (
            <div className="px-3 py-8 text-center text-sm text-muted">
              <Command size={20} className="mx-auto mb-2 opacity-40" />
              Type at least 2 characters to search
            </div>
          ) : results.length === 0 && !loading ? (
            <p className="px-3 py-8 text-center text-sm text-muted">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <ul className="space-y-0.5">
              {results.map((result) => {
                const Icon = typeIcons[result.type];
                return (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      type="button"
                      onClick={() => navigate(result.href)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-cream"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-green/5 text-green">
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-green">
                          {result.title}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {result.subtitle}
                        </span>
                      </span>
                      <span className="label-caps text-[0.6rem] text-muted">
                        {result.type}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-green/10 bg-cream/50 px-4 py-3 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between sm:py-2">
          <span className="hidden sm:inline">↑↓ navigate · Enter open · Esc close</span>
          <span className="sm:hidden">Tap result to open · Esc close</span>
          <Link
            href="/admin/orders"
            onClick={onClose}
            className="text-green hover:text-terra"
          >
            View all orders
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Registers ⌘K / Ctrl+K globally within admin shell */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return {
    open,
    openPalette: () => setOpen(true),
    closePalette: () => setOpen(false),
  };
}
