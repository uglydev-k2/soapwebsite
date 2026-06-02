import Link from "next/link";
import { getRelatedProducts } from "@/lib/products";
import { formatPrice, getCategoryGradient } from "@/lib/utils";
import type { Category } from "@prisma/client";
import { cn } from "@/lib/utils";

export async function CompleteYourRitual({
  category,
  excludeSlug,
}: {
  category: Category;
  excludeSlug: string;
}) {
  const related = await getRelatedProducts(category, excludeSlug, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-20 border-t border-green/10 pt-16">
      <h2 className="font-serif text-3xl text-green">Complete Your Ritual</h2>
      <p className="mt-2 text-sm text-muted">
        Pair with these botanical picks from the same collection.
      </p>
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((product) => (
          <li key={product.id}>
            <Link
              href={`/collections/${product.slug}`}
              className="group block border border-green/10 bg-white p-5 transition-shadow hover:shadow-md"
              style={{ borderRadius: "2px" }}
            >
              <div
                className={cn(
                  "mb-4 aspect-square bg-gradient-to-br",
                  getCategoryGradient(product.category)
                )}
              />
              <p className="font-serif text-lg text-green group-hover:text-terra">
                {product.name}
              </p>
              {product.fragrance && (
                <p className="mt-1 text-xs text-muted">{product.fragrance}</p>
              )}
              <p className="mt-3 font-serif text-terra">{formatPrice(product.price)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
