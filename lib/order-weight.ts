import type { Category, OrderItem, Product } from "@prisma/client";
import {
  calculateCartWeightOz,
  toUspsBillingWeightOz,
  type CartWeightItem,
} from "@/lib/product-weight";

export type OrderWeightItem = OrderItem & { product: Pick<Product, "category" | "name" | "slug" | "weightOz"> };

export function getOrderWeightOz(items: OrderWeightItem[]): {
  weightOz: number;
  billingTier: string;
  billingOz: number;
} {
  const cartItems: CartWeightItem[] = items.map((item) => ({
    category: item.product.category as Category,
    name: item.product.name,
    slug: item.product.slug,
    quantity: item.quantity,
    weightOz: item.product.weightOz,
  }));

  const weightOz = calculateCartWeightOz(cartItems);
  const { billingOz, tier } = toUspsBillingWeightOz(weightOz);

  return {
    weightOz: Math.round(weightOz * 10) / 10,
    billingTier: tier,
    billingOz,
  };
}
