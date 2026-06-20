export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import OrdersPageClient from "@/components/admin/OrdersPageClient";
import { getAdminOrders } from "@/lib/admin-data";
import { orderPurchaseTypeWhere } from "@/lib/admin-orders";
import type { Prisma } from "@prisma/client";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; type?: string };
}) {
  const where: Prisma.OrderWhereInput = {};
  if (searchParams.status && searchParams.status !== "ALL") {
    where.status = searchParams.status as Prisma.OrderWhereInput["status"];
  }
  if (searchParams.type === "subscription") {
    Object.assign(where, orderPurchaseTypeWhere("subscription"));
  } else if (searchParams.type === "one_time") {
    Object.assign(where, orderPurchaseTypeWhere("one_time"));
  }
  if (searchParams.search) {
    where.OR = [
      { orderNumber: { contains: searchParams.search, mode: "insensitive" } },
      { customer: { email: { contains: searchParams.search, mode: "insensitive" } } },
    ];
  }

  const orders = await getAdminOrders(where);

  return (
    <AdminShell
      title="Orders"
      breadcrumbs={[{ label: "Commerce" }, { label: "Orders" }]}
      showNewProduct={false}
    >
      <OrdersPageClient
        orders={orders}
        initialStatus={searchParams.status || "ALL"}
        initialType={searchParams.type || "ALL"}
      />
    </AdminShell>
  );
}
