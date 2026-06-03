import Link from "next/link";
import { getProductsBySlugs } from "@/lib/products";
import { formatPrice, getCategoryGradient } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ShopThisRitualProps {
  productSlugs: string[];
  title?: string;
}

export async function ShopThisRitual({
  productSlugs,
  title = "Shop This Ritual",
}: ShopThisRitualProps) {
  const products = await getProductsBySlugs(productSlugs);
  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-green/10 pt-12">
      <h2 className="subheading text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-muted">
        Products featured in this ritual — add them to your cart in one tap.
      </p>
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/collections/${product.slug}`}
              className="group flex gap-4 border border-green/10 bg-white p-4 transition-shadow hover:shadow-md"
              style={{ borderRadius: "2px" }}
            >
              <div
                className={cn(
                  "h-20 w-20 shrink-0 bg-gradient-to-br",
                  getCategoryGradient(product.category)
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="subheading text-lg group-hover:text-terra">
                  {product.name}
                </p>
                {product.fragrance && (
                  <p className="mt-1 text-xs text-muted">{product.fragrance}</p>
                )}
                <p className="mt-2 font-serif text-terra">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/collections"
        className="mt-6 inline-block label-caps text-green hover:text-terra"
      >
        Browse all products →
      </Link>
    </section>
  );
}
