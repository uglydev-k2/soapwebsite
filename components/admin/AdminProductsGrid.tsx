import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CategoryBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import type { AdminProduct } from "@/lib/admin-product-select";

export function AdminProductsGrid({
  products,
  loadError,
}: {
  products: AdminProduct[];
  loadError?: string | null;
}) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-muted">
        <p className="mb-2 font-serif text-xl text-green">No products in catalog</p>
        <p className="mb-4 text-sm">
          {loadError
            ? "Database error — see message above, then refresh."
            : "Create a product or clear any active filters."}
        </p>
        <Link href="/admin/products/new">
          <Button className="mt-4">+ New Product</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <article key={p.id} className="admin-card overflow-hidden">
          <div
            className="relative h-40 bg-green/10"
            style={{
              background: p.images[0]
                ? undefined
                : `linear-gradient(135deg, var(--green-2), var(--green))`,
            }}
          >
            {p.images[0] ? (
              <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="320px" />
            ) : null}
          </div>
          <div className="p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="font-serif text-lg text-green">{p.name}</h3>
              <CategoryBadge category={p.category} />
            </div>
            <p className="label-caps mb-2 text-[0.65rem] text-muted">{p.slug}</p>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="font-serif text-green">{formatPrice(p.price)}</span>
              {p.comparePrice ? (
                <span className="text-sm text-muted line-through">
                  {formatPrice(p.comparePrice)}
                </span>
              ) : null}
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
              Stock: {p.stock} · {p.active ? "Active" : "Inactive"}
            </p>
            <Link
              href={`/admin/products/${p.id}`}
              className="label-caps text-sm text-terra hover:text-terra-2"
            >
              Edit product →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
