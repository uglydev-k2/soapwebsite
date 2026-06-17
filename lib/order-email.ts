import type { ShippingAddress, ValidatedCartItem } from "@/lib/checkout";
import type {
  EmailOrderItem,
  OrderConfirmationEmailPayload,
} from "@/lib/email-templates";
import { pickProductImage } from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";

export async function refreshCartItemImages(
  cartItems: ValidatedCartItem[]
): Promise<ValidatedCartItem[]> {
  if (!isDatabaseConfigured() || cartItems.length === 0) return cartItems;

  const products = await prisma.product.findMany({
    where: { id: { in: cartItems.map((item) => item.productId) } },
    select: { id: true, images: true },
  });
  const imageById = new Map(
    products.map((product) => [product.id, pickProductImage(product.images)])
  );

  return cartItems.map((item) => ({
    ...item,
    image: imageById.get(item.productId) ?? item.image,
  }));
}

export function buildOrderConfirmationPayload(input: {
  orderNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  cartItems: ValidatedCartItem[];
}): OrderConfirmationEmailPayload {
  const items: EmailOrderItem[] = input.cartItems.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    image: item.image,
    slug: item.slug,
    fragrance: item.fragrance,
    categoryLabel: item.categoryLabel,
    itemNumber: item.slug.toUpperCase(),
  }));

  return {
    orderNumber: input.orderNumber,
    firstName: input.firstName,
    email: input.email,
    items,
    subtotal: input.subtotal,
    shipping: input.shipping,
    tax: input.tax,
    total: input.total,
    shippingAddress: input.shippingAddress,
    recipientName: `${input.firstName} ${input.lastName}`.trim(),
  };
}

export type { OrderConfirmationEmailPayload };
