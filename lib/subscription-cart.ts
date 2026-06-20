export type SubscriptionCartSnapshot = {
  items: {
    productId: string;
    scentOptionId?: string;
    scentLabel?: string;
    quantity: number;
    price: number;
    name?: string;
    slug?: string;
    image?: string;
  }[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
};

export function parseSubscriptionCartSnapshot(
  raw: unknown
): SubscriptionCartSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<SubscriptionCartSnapshot>;
  if (!Array.isArray(data.items) || !data.totals) return null;
  return {
    items: data.items,
    totals: data.totals,
  };
}
