import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { ShippingAddress, ValidatedCartItem } from "@/lib/checkout";

export type SupabaseOrderRecord = {
  id: string;
  order_number: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  payment_provider: string;
  stripe_session_id: string | null;
  shipping_address: ShippingAddress;
  created_at: string;
  order_items: {
    id: string;
    product_id: string;
    product_name: string;
    product_slug: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
};

interface SaveSupabaseOrderInput {
  orderNumber: string;
  userId?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  stripeSessionId: string;
  shippingAddress: ShippingAddress;
  items: ValidatedCartItem[];
}

export async function saveOrderToSupabase(
  input: SaveSupabaseOrderInput
): Promise<string | null> {
  if (!isSupabaseAdminConfigured()) return null;

  try {
    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: input.orderNumber,
        user_id: input.userId ?? null,
        email: input.email,
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone ?? null,
        status: input.status ?? "processing",
        subtotal: input.subtotal,
        shipping: input.shipping,
        tax: input.tax,
        total: input.total,
        currency: "usd",
        payment_provider: "stripe",
        stripe_session_id: input.stripeSessionId,
        shipping_address: input.shippingAddress,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("[msvee:supabase-orders] Insert failed:", orderError);
      return null;
    }

    const orderItems = input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_slug: item.slug,
      quantity: item.quantity,
      unit_price: item.price,
      line_total: Math.round(item.price * item.quantity * 100) / 100,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("[msvee:supabase-orders] Items insert failed:", itemsError);
    }

    return order.id;
  } catch (error) {
    console.error("[msvee:supabase-orders] Unexpected error:", error);
    return null;
  }
}

export async function getSupabaseOrderByStripeSession(
  stripeSessionId: string
): Promise<SupabaseOrderRecord | null> {
  if (!isSupabaseAdminConfigured()) return null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        email,
        first_name,
        last_name,
        phone,
        status,
        subtotal,
        shipping,
        tax,
        total,
        currency,
        payment_provider,
        stripe_session_id,
        shipping_address,
        created_at,
        order_items (
          id,
          product_id,
          product_name,
          product_slug,
          quantity,
          unit_price,
          line_total
        )
      `
      )
      .eq("stripe_session_id", stripeSessionId)
      .maybeSingle();

    if (error || !data) return null;
    return data as SupabaseOrderRecord;
  } catch {
    return null;
  }
}

export async function getSupabaseOrdersForUser(
  userId: string,
  email: string
): Promise<SupabaseOrderRecord[]> {
  if (!isSupabaseAdminConfigured()) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        email,
        first_name,
        last_name,
        phone,
        status,
        subtotal,
        shipping,
        tax,
        total,
        currency,
        payment_provider,
        stripe_session_id,
        shipping_address,
        created_at,
        order_items (
          id,
          product_id,
          product_name,
          product_slug,
          quantity,
          unit_price,
          line_total
        )
      `
      )
      .or(`user_id.eq.${userId},email.eq.${email}`)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as SupabaseOrderRecord[];
  } catch {
    return [];
  }
}
