export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import OrdersPageClient from "@/components/admin/OrdersPageClient";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const where: Record<string, unknown> = {};
  if (searchParams.status && searchParams.status !== "ALL") {
    where.status = searchParams.status;
  }
  if (searchParams.search) {
    where.OR = [
      { orderNumber: { contains: searchParams.search, mode: "insensitive" } },
      { customer: { email: { contains: searchParams.search, mode: "insensitive" } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: { select: { firstName: true, lastName: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      title="Orders"
      breadcrumbs={[{ label: "Commerce" }, { label: "Orders" }]}
      showNewProduct={false}
    >
      <OrdersPageClient orders={orders} initialStatus={searchParams.status || "ALL"} />
    </AdminShell>
  );
}
