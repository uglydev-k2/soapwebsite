import type { ShippingAddress, ValidatedCartItem } from "@/lib/checkout";
import type {
  EmailOrderItem,
  OrderConfirmationEmailPayload,
} from "@/lib/email-templates";

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
