import { getActiveProducts } from "@/lib/products";
import { jsonResponse } from "@/lib/api-helpers";
import { formatPrice } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return jsonResponse({ products: [] });
  }

  const products = await getActiveProducts({ q, sort: "featured" });

  return jsonResponse({
    products: products.slice(0, 8).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      priceLabel: formatPrice(p.price),
      fragrance: p.fragrance,
      image: p.images[0] ?? null,
    })),
  });
}
