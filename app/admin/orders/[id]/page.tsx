export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import { OrderDetail } from "@/components/admin/OrderDetail";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });
  if (!order) notFound();

  return (
    <AdminShell
      title={`Order ${order.orderNumber}`}
      breadcrumbs={[
        { label: "Commerce" },
        { label: "Orders", href: "/admin/orders" },
        { label: order.orderNumber },
      ]}
      showNewProduct={false}
    >
      <OrderDetail order={order} />
    </AdminShell>
  );
}
