export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProductsGrid } from "@/components/admin/AdminProductsGrid";
import { AdminProductsToolbar } from "@/components/admin/AdminProductsToolbar";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { getAdminProducts } from "@/lib/admin-data";
import { parseProductListFilters } from "@/lib/parse-product-filters";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; status?: string; view?: string };
}) {
  const where = parseProductListFilters(searchParams);
  const { products, error } = await getAdminProducts(where);
  const view = searchParams.view || "grid";

  return (
    <AdminShell
      title="Products"
      breadcrumbs={[{ label: "Catalog" }, { label: "Products" }]}
    >
      {error ? (
        <div className="mb-6 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load products: {error}
        </div>
      ) : null}

      <AdminProductsToolbar searchParams={searchParams} productCount={products.length} />

      {view === "table" ? (
        products.length === 0 ? (
          <AdminProductsGrid products={[]} loadError={error} />
        ) : (
          <ProductsTable products={products} />
        )
      ) : (
        <AdminProductsGrid products={products} loadError={error} />
      )}

      <p className="mt-8 text-center text-xs text-muted">
        Catalog loaded from database · {products.length} items ·{" "}
        <Link href="/admin/products" className="text-terra hover:underline">
          Clear filters
        </Link>
      </p>
    </AdminShell>
  );
}
