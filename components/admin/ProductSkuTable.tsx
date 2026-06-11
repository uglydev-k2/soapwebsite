"use client";

import Link from "next/link";
import type { ProductSkuMetric } from "@/lib/admin-analytics";
import { categoryLabels, formatPrice, getCategoryLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductSkuTableProps {
  skus: ProductSkuMetric[];
  className?: string;
}

export function ProductSkuTable({ skus, className }: ProductSkuTableProps) {
  const exportCsv = () => {
    const header =
      "Product,Slug,Category,Price,Stock,Units Sold,Orders,Revenue\n";
    const body = skus
      .map((sku) =>
        [
          `"${sku.name.replace(/"/g, '""')}"`,
          sku.slug,
          sku.category,
          sku.price,
          sku.stock,
          sku.unitsSold,
          sku.orderCount,
          sku.revenue.toFixed(2),
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product-sku-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (skus.length === 0) {
    return (
      <div className={cn("admin-card p-8 text-center text-sm text-muted", className)}>
        No product sales data for this period.
      </div>
    );
  }

  return (
    <div className={cn("admin-card overflow-hidden", className)}>
      <div className="flex flex-col gap-3 border-b border-green/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="label-caps text-muted">Product Performance by SKU</h3>
          <p className="mt-1 text-xs text-muted">
            Units sold, revenue, and current stock for every active product.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="label-caps border border-green/15 px-3 py-2 text-xs text-green transition-colors hover:border-terra hover:text-terra"
        >
          Export CSV
        </button>
      </div>

      <ul className="admin-mobile-list">
        {skus.map((sku) => (
          <li key={sku.productId} className="admin-mobile-card">
            <Link
              href={`/admin/products/${sku.productId}`}
              className="font-serif text-base text-green hover:text-terra"
            >
              {sku.name}
            </Link>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:text-xs">
              <div>
                <span className="text-muted">Revenue</span>
                <p className="font-medium text-green">{formatPrice(sku.revenue)}</p>
              </div>
              <div>
                <span className="text-muted">Units sold</span>
                <p className="font-medium text-green">{sku.unitsSold}</p>
              </div>
              <div>
                <span className="text-muted">Stock</span>
                <p className={cn("font-medium", sku.stock <= 10 ? "text-terra" : "text-green")}>
                  {sku.stock}
                </p>
              </div>
              <div>
                <span className="text-muted">Orders</span>
                <p className="font-medium text-green">{sku.orderCount}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-green/10 bg-cream/40 text-left">
              {["Product", "Category", "Price", "Stock", "Units", "Orders", "Revenue"].map(
                (label) => (
                  <th
                    key={label}
                    className="label-caps px-4 py-3 text-muted"
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {skus.map((sku) => (
              <tr
                key={sku.productId}
                className="border-b border-green/5 transition-colors hover:bg-cream/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${sku.productId}`}
                    className="font-serif text-green hover:text-terra"
                  >
                    {sku.name}
                  </Link>
                  <p className="text-[11px] text-muted">{sku.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted">
                  {getCategoryLabel(sku.category) ||
                    categoryLabels[sku.category as keyof typeof categoryLabels] ||
                    sku.category}
                </td>
                <td className="px-4 py-3">{formatPrice(sku.price)}</td>
                <td
                  className={cn(
                    "px-4 py-3",
                    sku.stock <= 10 ? "font-medium text-terra" : "text-green"
                  )}
                >
                  {sku.stock}
                </td>
                <td className="px-4 py-3">{sku.unitsSold}</td>
                <td className="px-4 py-3">{sku.orderCount}</td>
                <td className="px-4 py-3 font-medium text-green">
                  {formatPrice(sku.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
