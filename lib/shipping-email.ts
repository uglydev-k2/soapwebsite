import type { Customer, Order, OrderItem, Product } from "@prisma/client";
import type { DeliveredEmailPayload, EmailOrderItem } from "@/lib/email-templates";
import { parseOrderNotes } from "@/lib/order-notes";
import { parseTrackingInput } from "@/lib/tracking";
import { getCategoryLabel } from "@/lib/utils";

type OrderProduct = Pick<
  Product,
  "name" | "images" | "slug" | "fragrance" | "category"
>;

type OrderWithRelations = Order & {
  customer: Customer;
  items: (OrderItem & { product: OrderProduct })[];
};

function mapOrderItems(items: OrderWithRelations["items"]): EmailOrderItem[] {
  return items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
    image: item.product.images[0] ?? null,
    slug: item.product.slug,
    fragrance: item.product.fragrance,
    categoryLabel: getCategoryLabel(item.product.category),
    itemNumber: item.product.slug.toUpperCase(),
  }));
}

export function buildShippingEmailPayload(
  order: OrderWithRelations,
  options?: {
    trackingInfo?: string;
    shippedAt?: Date;
    carrier?: string;
    carrierService?: string;
  }
) {
  const meta = parseOrderNotes(order.notes);
  const tracking = parseTrackingInput(options?.trackingInfo ?? meta.trackingNumber);

  const items: EmailOrderItem[] = mapOrderItems(order.items);

  return {
    orderNumber: order.orderNumber,
    items,
    shippedAt: options?.shippedAt ?? new Date(),
    carrier: options?.carrier ?? meta.carrier ?? "USPS",
    carrierService: options?.carrierService ?? "USPS Ground Advantage",
    trackingNumber: tracking?.number,
    trackingUrl: tracking?.url,
    shippingAddress: meta.shippingAddress,
    recipientName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
  };
}

export function buildDeliveredEmailPayload(
  order: OrderWithRelations,
  deliveredAt?: Date
): DeliveredEmailPayload {
  const meta = parseOrderNotes(order.notes);

  return {
    orderNumber: order.orderNumber,
    firstName: order.customer.firstName,
    email: order.customer.email,
    items: mapOrderItems(order.items),
    deliveredAt: deliveredAt ?? new Date(),
    shippingAddress: meta.shippingAddress,
    recipientName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
  };
}
