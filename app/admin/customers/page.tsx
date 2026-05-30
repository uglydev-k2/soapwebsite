export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import CustomersPageClient from "@/components/admin/CustomersPageClient";
import { getAdminCustomers } from "@/lib/admin-data";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  const rows = customers.map((c) => ({
    id: c.id,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    status: c.status,
    lastActiveAt: c.lastActiveAt,
    createdAt: c.createdAt,
    ordersCount: c._count.orders,
    totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
  }));

  return (
    <AdminShell
      title="Customers"
      breadcrumbs={[{ label: "Commerce" }, { label: "Customers" }]}
      showNewProduct={false}
    >
      <CustomersPageClient customers={rows} />
    </AdminShell>
  );
}
