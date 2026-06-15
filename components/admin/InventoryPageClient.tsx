"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { AdminProduct } from "@/lib/admin-product-select";
import { Minus, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store/toastStore";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface InventoryPageClientProps {
  products: AdminProduct[];
  threshold: number;
}

export function InventoryPageClient({
  products: initialProducts,
  threshold,
}: InventoryPageClientProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [stockMap, setStockMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialProducts.map((p) => [p.id, p.stock]))
  );
  const [saving, setSaving] = useState(false);

  const changedIds = initialProducts
    .filter((p) => stockMap[p.id] !== p.stock)
    .map((p) => p.id);

  const adjust = (id: string, delta: number) => {
    setStockMap((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  };

  const save = async () => {
    if (changedIds.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: changedIds.map((id) => ({
            id,
            stock: stockMap[id],
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Failed to update stock", "error");
        return;
      }
      addToast(`Updated ${changedIds.length} product${changedIds.length > 1 ? "s" : ""}`);
      router.refresh();
    } catch {
      addToast("Failed to update stock", "error");
    } finally {
      setSaving(false);
    }
  };

  if (initialProducts.length === 0) {
    return (
      <div className="admin-card py-16 text-center">
        <p className="font-serif text-2xl text-green">Inventory looks healthy</p>
        <p className="mt-2 text-sm text-muted">
          No active products at or below {threshold} units.
        </p>
        <Link href="/admin/products" className="mt-6 inline-block label-caps text-terra">
          View all products →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {initialProducts.length} SKU{initialProducts.length > 1 ? "s" : ""} at or
          below {threshold} units
        </p>
        {changedIds.length > 0 && (
          <Button size="sm" onClick={save} disabled={saving} className="w-full gap-2 sm:w-auto">
            <Save size={14} />
            {saving ? "Saving…" : `Save ${changedIds.length} change${changedIds.length > 1 ? "s" : ""}`}
          </Button>
        )}
      </div>

      <ul className="space-y-4 sm:space-y-3">
        {initialProducts.map((product) => {
          const stock = stockMap[product.id] ?? product.stock;
          const changed = stock !== product.stock;
          const critical = stock === 0;

          return (
            <li
              key={product.id}
              className={cn(
                "admin-card flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                critical && "border-terra/30 bg-terra/5"
              )}
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="font-serif text-lg text-green hover:text-terra"
                >
                  {product.name}
                </Link>
                <p className="mt-1.5 text-sm text-muted">
                  {getCategoryLabel(product.category)} · {formatPrice(product.price)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <button
                  type="button"
                  onClick={() => adjust(product.id, -1)}
                  className="admin-touch-target border border-green/15 text-muted hover:text-green"
                  aria-label="Decrease stock"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) =>
                    setStockMap((prev) => ({
                      ...prev,
                      [product.id]: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className={cn(
                    "admin-input w-24 text-center text-lg sm:w-20 sm:text-base",
                    changed && "border-terra",
                    critical && "text-terra"
                  )}
                />
                <button
                  type="button"
                  onClick={() => adjust(product.id, 1)}
                  className="admin-touch-target border border-green/15 text-muted hover:text-green"
                  aria-label="Increase stock"
                >
                  <Plus size={16} />
                </button>
                {changed && (
                  <span className="text-xs text-terra">was {product.stock}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
