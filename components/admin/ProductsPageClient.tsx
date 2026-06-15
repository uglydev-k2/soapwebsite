"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { cn, formatPrice } from "@/lib/utils";
import { CategoryBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToastStore } from "@/store/toastStore";
import type { AdminProduct } from "@/lib/admin-product-select";
import { LayoutGrid, List, Trash2, Pencil } from "lucide-react";

export default function ProductsPageClient({
  initialView,
  initialProducts,
  loadError,
  productCount,
}: {
  initialView: string;
  initialProducts: AdminProduct[];
  loadError?: string | null;
  productCount: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const addToast = useToastStore((s) => s.addToast);
  const [view, setView] = useState(initialView);
  const [products, setProducts] = useState(initialProducts);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [searchDraft, setSearchDraft] = useState(params.get("search") || "");

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    setSearchDraft(params.get("search") || "");
  }, [params]);

  const updateFilter = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/admin/products?${p.toString()}`);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    addToast(active ? "Product activated" : "Product deactivated", "info");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId || confirmText !== "DELETE") return;
    await fetch(`/api/products/${deleteId}?hard=true`, { method: "DELETE" });
    addToast("Product deleted");
    setDeleteId(null);
    setConfirmText("");
    router.refresh();
  };

  return (
    <div>
      {loadError && (
        <div className="mb-6 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load products: {loadError}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          placeholder="Search products..."
          variant="admin"
          className="w-full sm:max-w-xs"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateFilter("search", searchDraft.trim());
          }}
        />
        <select
          className="admin-input w-full sm:max-w-[160px]"
          value={params.get("category") || ""}
          onChange={(e) => updateFilter("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className="admin-input w-full sm:max-w-[140px]"
          value={params.get("status") || ""}
          onChange={(e) => updateFilter("status", e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="hidden flex-1 sm:block" />
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="label-caps text-muted">
            {productCount} product{productCount === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={cn(
                "admin-touch-target",
                view === "grid" ? "text-terra" : "text-muted"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={cn(
                "admin-touch-target",
                view === "table" ? "text-terra" : "text-muted"
              )}
              aria-label="List view"
            >
              <List size={20} />
            </button>
          </div>
          <Link href="/admin/products/new" className="flex-1 sm:flex-none">
            <Button size="sm" className="w-full sm:w-auto">
              + New Product
            </Button>
          </Link>
        </div>
      </div>

      {view === "table" ? (
        <ProductsTable
          products={products}
          onDelete={(product) => setDeleteId(product.id)}
        />
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-muted">
          <p className="mb-2 font-serif text-xl text-green">No products in catalog</p>
          <p className="mb-4 text-sm">
            {loadError
              ? "Fix the database connection, then refresh this page."
              : "Create a product or clear any active filters."}
          </p>
          <Link href="/admin/products/new">
            <Button className="mt-4">+ New Product</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="admin-card overflow-hidden">
              <div
                className="h-40 bg-green/10"
                style={{
                  background: `linear-gradient(135deg, var(--green-2), var(--green))`,
                }}
              />
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-serif text-lg text-green">{p.name}</h3>
                  <CategoryBadge category={p.category} />
                </div>
                <p className="label-caps mb-2 text-[0.65rem] text-muted">{p.slug}</p>
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="font-serif text-green">{formatPrice(p.price)}</span>
                  {p.comparePrice && (
                    <span className="text-sm text-muted line-through">
                      {formatPrice(p.comparePrice)}
                    </span>
                  )}
                </div>
                <p
                  className={`label-caps mb-4 text-xs ${
                    p.stock > 20
                      ? "text-green"
                      : p.stock >= 5
                        ? "text-amber-600"
                        : "text-terra"
                  }`}
                >
                  Stock: {p.stock}
                </p>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={p.active}
                      onChange={(e) => toggleActive(p.id, e.target.checked)}
                    />
                    Active
                  </label>
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${p.id}`}>
                      <button className="text-green hover:text-terra">
                        <Pencil size={16} />
                      </button>
                    </Link>
                    <button
                      className="text-terra hover:text-terra-2"
                      onClick={() => setDeleteId(p.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product">
        <p className="mb-4 text-sm text-muted">
          Are you sure? This cannot be undone. Type DELETE to confirm.
        </p>
        <Input
          variant="admin"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
        />
        <div className="mt-4 flex gap-3">
          <Button variant="danger" onClick={handleDelete} disabled={confirmText !== "DELETE"}>
            Delete Permanently
          </Button>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
