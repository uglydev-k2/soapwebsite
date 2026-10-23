export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardView } from "@/components/admin/DashboardView";
import { getDashboardData } from "@/lib/dashboard";
import { getAdminOverview } from "@/lib/admin-overview";
import { getPendingFulfillmentOrders } from "@/lib/admin-inventory";
import { getDashboardPermissions } from "@/lib/dashboard-widgets";
import { getAdminSession } from "@/lib/admin-auth";
import { getVisitorStats } from "@/lib/visitors";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const permissions = getDashboardPermissions(session?.role);

  const [data, overview, fulfillmentOrders, visitorStats] = await Promise.all([
    getDashboardData(),
    getAdminOverview(),
    getPendingFulfillmentOrders(6),
    getVisitorStats(),
  ]);

  return (
    <AdminShell title="Command Center" breadcrumbs={[{ label: "Overview" }]}>
      <DashboardView
        permissions={permissions}
        data={data}
        overview={overview}
        fulfillmentOrders={fulfillmentOrders}
        visitorStats={visitorStats}
      />
    </AdminShell>
  );
}
