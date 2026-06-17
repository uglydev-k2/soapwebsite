import type { Customer, Order, OrderItem, Product } from "@prisma/client";
import type { EmailOrderItem } from "@/lib/email-templates";
import { parseOrderNotes } from "@/lib/order-notes";
import { parseTrackingInput } from "@/lib/tracking";

type OrderWithRelations = Order & {
  customer: Customer;
  items: (OrderItem & { product: Pick<Product, "name" | "images" | "slug"> })[];
};

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

  const items: EmailOrderItem[] = order.items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
    image: item.product.images[0] ?? null,
    itemNumber: item.product.slug.toUpperCase(),
  }));

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
