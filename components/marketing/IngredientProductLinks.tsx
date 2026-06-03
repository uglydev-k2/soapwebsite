import Link from "next/link";
import { getProductsByIngredientKeywords } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import type { IngredientEntry } from "@/lib/content/ingredients";

export async function IngredientProductLinks({
  ingredient,
}: {
  ingredient: IngredientEntry;
}) {
  const products = await getProductsByIngredientKeywords(ingredient.keywords, 3);
  if (products.length === 0) return null;

  return (
    <div className="mt-4 border-t border-green/10 pt-4">
      <p className="label-caps text-muted">Found in</p>
      <ul className="mt-2 space-y-1">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/collections/${product.slug}`}
              className="text-sm text-green transition-colors hover:text-terra"
            >
              {product.name}
              <span className="ml-2 text-muted">{formatPrice(product.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
