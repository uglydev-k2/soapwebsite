import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PRODUCT_CATEGORIES } from "@/lib/categories";

export function AdminProductsToolbar({
  searchParams,
  productCount,
}: {
  searchParams: Record<string, string | undefined>;
  productCount: number;
}) {
  const view = searchParams.view || "grid";

  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-end">
      <form method="get" className="flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="block w-full sm:max-w-xs">
          <span className="label-caps mb-2 block text-muted">Search</span>
          <input
            name="search"
            defaultValue={searchParams.search ?? ""}
            placeholder="Search products..."
            className="input-admin w-full"
          />
        </label>
        <label className="block w-full sm:max-w-[160px]">
          <span className="label-caps mb-2 block text-muted">Category</span>
          <select name="category" defaultValue={searchParams.category ?? ""} className="admin-input w-full">
            <option value="">All Categories</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block w-full sm:max-w-[140px]">
          <span className="label-caps mb-2 block text-muted">Status</span>
          <select name="status" defaultValue={searchParams.status ?? ""} className="admin-input w-full">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <input type="hidden" name="view" value={view} />
        <Button type="submit" size="sm" className="w-full sm:w-auto">
          Apply filters
        </Button>
      </form>

      <div className="flex flex-1 items-center justify-between gap-3 sm:justify-end">
        <p className="label-caps text-muted">
          {productCount} product{productCount === 1 ? "" : "s"}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/admin/products?${new URLSearchParams(
              Object.entries({ ...searchParams, view: "grid" }).filter(
                ([, v]) => v != null && v !== ""
              ) as [string, string][]
            ).toString()}`}
            className={`admin-touch-target ${view === "grid" ? "text-terra" : "text-muted"}`}
            aria-label="Grid view"
          >
            ▦
          </Link>
          <Link
            href={`/admin/products?${new URLSearchParams(
              Object.entries({ ...searchParams, view: "table" }).filter(
                ([, v]) => v != null && v !== ""
              ) as [string, string][]
            ).toString()}`}
            className={`admin-touch-target ${view === "table" ? "text-terra" : "text-muted"}`}
            aria-label="List view"
          >
            ☰
          </Link>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm">+ New Product</Button>
        </Link>
      </div>
    </div>
  );
}
