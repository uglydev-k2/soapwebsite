import { adminProductSelect } from "@/lib/admin-product-select";
import { safeDbQuery } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { countLowStockItems } from "@/lib/admin-inventory";
import {
  getMissingProductionEnv,
  isDatabaseConfigured,
  OPTIONAL_ENV,
} from "@/lib/env";
import { isPushConfigured } from "@/lib/push-notifications";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminAlert = {
  id: string;
  title: string;
  description: string;
  count: number;
  href: string;
  severity: "critical" | "warning" | "info";
};

export type ServiceHealth = {
  id: string;
  label: string;
  status: "ok" | "degraded" | "offline";
  detail: string;
};

const EMPTY_OVERVIEW = {
  alerts: [] as AdminAlert[],
  services: [] as ServiceHealth[],
  pendingOrders: 0,
  lowStockCount: 0,
  flaggedProducts: 0,
  newsletterSubscribers: 0,
};

export async function getAdminOverview() {
  return safeDbQuery("getAdminOverview", fetchAdminOverview, EMPTY_OVERVIEW);
}

async function fetchAdminOverview() {
  const [pendingOrders, lowStockCount, flaggedProducts, newsletterSubscribers] =
    await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      countLowStockItems(),
      prisma.product.count({ where: { moderationStatus: "FLAGGED" } }),
      prisma.newsletterSubscriber.count(),
    ]);

  const alerts: AdminAlert[] = [];

  if (pendingOrders > 0) {
    alerts.push({
      id: "pending-orders",
      title: "Pending orders",
      description: `${pendingOrders} order${pendingOrders > 1 ? "s" : ""} awaiting fulfillment`,
      count: pendingOrders,
      href: "/admin/orders?status=PENDING",
      severity: pendingOrders >= 5 ? "critical" : "warning",
    });
  }

  if (lowStockCount > 0) {
    alerts.push({
      id: "low-stock",
      title: "Low inventory",
      description: `${lowStockCount} product or scent variant${lowStockCount > 1 ? "s" : ""} below 10 units`,
      count: lowStockCount,
      href: "/admin/inventory",
      severity: "warning",
    });
  }

  if (flaggedProducts > 0) {
    alerts.push({
      id: "flagged-content",
      title: "Flagged products",
      description: `${flaggedProducts} item${flaggedProducts > 1 ? "s" : ""} need moderation review`,
      count: flaggedProducts,
      href: "/admin/content?status=FLAGGED",
      severity: "info",
    });
  }

  const missingRequired = getMissingProductionEnv();
  if (missingRequired.length > 0) {
    alerts.push({
      id: "missing-env",
      title: "Production config incomplete",
      description: `Missing: ${missingRequired.join(", ")}`,
      count: missingRequired.length,
      href: "/admin/system",
      severity: "critical",
    });
  }

  const services = buildServiceHealth(missingRequired);

  return {
    alerts,
    services,
    pendingOrders,
    lowStockCount,
    flaggedProducts,
    newsletterSubscribers,
  };
}

function buildServiceHealth(missingRequired: string[]): ServiceHealth[] {
  const dbOk = isDatabaseConfigured();
  const squareOk = Boolean(
    process.env.SQUARE_ACCESS_TOKEN?.trim() &&
      process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID?.trim()
  );
  const resendOk = Boolean(process.env.RESEND_API_KEY?.trim());
  const uploadOk = isSupabaseConfigured();
  const pushOk = isPushConfigured();

  const optionalMissing = OPTIONAL_ENV.filter(
    (key) => !process.env[key]?.trim()
  );

  return [
    {
      id: "database",
      label: "Database",
      status: dbOk ? "ok" : "offline",
      detail: dbOk ? "PostgreSQL connected" : "DATABASE_URL not configured",
    },
    {
      id: "auth",
      label: "Authentication",
      status: missingRequired.includes("AUTH_SECRET") ? "offline" : "ok",
      detail: missingRequired.includes("AUTH_SECRET")
        ? "AUTH_SECRET missing"
        : "NextAuth configured",
    },
    {
      id: "square",
      label: "Square Payments",
      status: squareOk ? "ok" : "degraded",
      detail: squareOk ? "Live checkout enabled" : "Square credentials not set",
    },
    {
      id: "email",
      label: "Email (Resend)",
      status: resendOk ? "ok" : "degraded",
      detail: resendOk
        ? "Transactional email ready"
        : "RESEND_API_KEY not set — emails disabled",
    },
    {
      id: "uploads",
      label: "Media Uploads",
      status: uploadOk ? "ok" : "degraded",
      detail: uploadOk
        ? "Supabase Storage (products bucket)"
        : "Supabase env vars not set",
    },
    {
      id: "push",
      label: "Browser Push (VAPID)",
      status: pushOk ? "ok" : "degraded",
      detail: pushOk
        ? "Background push notifications ready"
        : "VAPID keys not set — foreground alerts only",
    },
    {
      id: "optional",
      label: "Optional integrations",
      status: optionalMissing.length <= 3 ? "ok" : "degraded",
      detail:
        optionalMissing.length === 0
          ? "All optional services configured"
          : `${optionalMissing.length} optional env vars unset`,
    },
  ];
}

export type AdminSearchResult = {
  type: "order" | "product" | "customer";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export async function adminGlobalSearch(query: string, limit = 8) {
  const q = query.trim();
  if (q.length < 2) return [] as AdminSearchResult[];

  return safeDbQuery(
    "adminGlobalSearch",
    () => fetchSearchResults(q, limit),
    [] as AdminSearchResult[]
  );
}

async function fetchSearchResults(query: string, limit: number) {
  const [orders, products, customers] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: query, mode: "insensitive" } },
          { customer: { email: { contains: query, mode: "insensitive" } } },
        ],
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { email: true } } },
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { name: "asc" },
      select: adminProductSelect,
    }),
    prisma.customer.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const results: AdminSearchResult[] = [];

  for (const order of orders) {
    results.push({
      type: "order",
      id: order.id,
      title: order.orderNumber,
      subtitle: order.customer.email,
      href: `/admin/orders/${order.id}`,
    });
  }

  for (const product of products) {
    results.push({
      type: "product",
      id: product.id,
      title: product.name,
      subtitle: product.slug,
      href: `/admin/products/${product.id}`,
    });
  }

  for (const customer of customers) {
    results.push({
      type: "customer",
      id: customer.id,
      title: `${customer.firstName} ${customer.lastName}`.trim() || customer.email,
      subtitle: customer.email,
      href: `/admin/customers?id=${customer.id}`,
    });
  }

  return results.slice(0, limit);
}
