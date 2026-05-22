"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Category, Product } from "@prisma/client";
import {
  categoryLabels,
  cn,
  formatDate,
  formatPrice,
  getCategoryGradient,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ProductsTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  className?: string;
}

type SortKey = "name" | "category" | "price" | "stock" | "updatedAt";
type SortDir = "asc" | "desc";

export function ProductsTable({
  products,
  onEdit,
  onDelete,
  className,
}: ProductsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "price":
          cmp = a.price - b.price;
          break;
        case "stock":
          cmp = a.stock - b.stock;
          break;
        case "updatedAt":
          cmp =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [products, sortKey, sortDir]);

  const SortHeader = ({
    label,
    col,
  }: {
    label: string;
    col: SortKey;
  }) => (
    <th
      className="label-caps cursor-pointer px-4 py-3 text-muted hover:text-green"
      onClick={() => handleSort(col)}
    >
      {label}
      {sortKey === col && (
        <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
      )}
    </th>
  );

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="font-serif text-xl text-green/60">No products found</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-green/10">
            <th className="label-caps px-4 py-3 text-muted">Image</th>
            <SortHeader label="Name" col="name" />
            <SortHeader label="Category" col="category" />
            <SortHeader label="Price" col="price" />
            <SortHeader label="Stock" col="stock" />
            <th className="label-caps px-4 py-3 text-muted">Status</th>
            <SortHeader label="Updated" col="updatedAt" />
            <th className="label-caps px-4 py-3 text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((product) => (
            <tr
              key={product.id}
              className="border-b border-green/5 transition-colors hover:bg-cream/50"
            >
              <td className="px-4 py-3">
                <div
                  className={cn(
                    "relative h-12 w-12 overflow-hidden bg-gradient-to-br",
                    getCategoryGradient(product.category)
                  )}
                >
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-lg opacity-40">
                      🧴
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="font-serif text-base text-green">{product.name}</p>
                <p className="text-xs text-muted">{product.slug}</p>
              </td>
              <td className="px-4 py-3">
                <Badge variant="default">
                  {categoryLabels[product.category as Category]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <span className="font-medium">{formatPrice(product.price)}</span>
                {product.comparePrice && (
                  <span className="ml-2 text-xs text-muted line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "font-medium",
                    product.stock < 5
                      ? "text-red-600"
                      : product.stock <= 20
                        ? "text-amber-700"
                        : "text-green"
                  )}
                >
                  {product.stock}
                </span>
              </td>
              <td className="px-4 py-3">
                <Badge
                  className={cn(
                    product.active
                      ? "bg-green/10 text-green"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {product.active ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted text-xs">
                {formatDate(product.updatedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => onEdit?.(product)}
                    aria-label={`Edit ${product.name}`}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => onDelete?.(product)}
                    className="text-terra hover:border-terra hover:text-terra"
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
