export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import { OrderDetail } from "@/components/admin/OrderDetail";
import { getAdminOrder } from "@/lib/admin-data";
import { notFound } from "next/navigation";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getAdminOrder(params.id);
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
