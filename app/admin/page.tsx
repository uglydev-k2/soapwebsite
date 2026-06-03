export const dynamic = "force-dynamic";

import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { KpiCard } from "@/components/admin/KpiCard";
import { CategoryDonut } from "@/components/admin/CategoryDonut";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { DashboardQuickActions } from "@/components/admin/DashboardQuickActions";
import { OpsCenter } from "@/components/admin/OpsCenter";
import { SystemHealthPanel } from "@/components/admin/SystemHealthPanel";
import {
  CustomerGrowthChart,
  RevenueBarChart,
} from "@/components/admin/GrowthCharts";
import { getDashboardData } from "@/lib/dashboard";
import { getAdminOverview } from "@/lib/admin-overview";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [data, overview] = await Promise.all([
    getDashboardData(),
    getAdminOverview(),
  ]);

  const customerSparkline = data.customerGrowth.slice(-6).map((m) => m.count);
  const revenueSparkline = data.revenueSparkline;

  return (
    <AdminShell title="Command Center" breadcrumbs={[{ label: "Overview" }]}>
      <DashboardQuickActions />

      <div className="mb-6 mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatPrice(data.kpis.totalRevenue)}
          change={`${data.kpis.revenueChange >= 0 ? "+" : ""}${data.kpis.revenueChange}% vs last month`}
          changeType={data.kpis.revenueChange >= 0 ? "positive" : "negative"}
          sparkline={revenueSparkline}
          href="/admin/billing"
        />
        <KpiCard
          label="Orders This Week"
          value={String(data.kpis.ordersChange)}
          change={`${data.kpis.totalOrders} lifetime orders`}
          changeType="neutral"
          sparkline={data.orderSparkline}
          href="/admin/orders"
        />
        <KpiCard
          label="Customers"
          value={String(data.kpis.totalCustomers)}
          change={`+${data.kpis.newSignupsToday} today`}
          changeType="positive"
          sparkline={customerSparkline}
          href="/admin/customers"
        />
        <KpiCard
          label="Monthly Revenue"
          value={formatPrice(data.kpis.mrr)}
          change={`${data.kpis.totalProducts} active SKUs`}
          changeType="neutral"
          sparkline={revenueSparkline}
          href="/admin/analytics"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <OpsCenter
            alerts={overview.alerts}
            pendingOrders={overview.pendingOrders}
            lowStockCount={overview.lowStockCount}
            flaggedProducts={overview.flaggedProducts}
          />
        </div>
        <SystemHealthPanel services={overview.services} compact />
      </div>

      {data.kpis.lowStockCount > 0 && (
        <div className="mb-6 flex flex-col gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {data.kpis.lowStockCount} product
            {data.kpis.lowStockCount > 1 ? "s are" : " is"} running low on stock
          </span>
          <Link href="/admin/products" className="label-caps underline">
            Review Inventory →
          </Link>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="admin-card p-6 lg:col-span-2">
          <h2 className="label-caps mb-4 text-muted">Customer Growth (12 mo)</h2>
          <CustomerGrowthChart data={data.customerGrowth} />
        </div>
        <div className="admin-card p-6">
          <h2 className="label-caps mb-4 text-muted">Catalog by Category</h2>
          <CategoryDonut data={data.categoryBreakdown} />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="admin-card p-6 lg:col-span-2">
          <h2 className="label-caps mb-4 text-muted">Revenue by Month</h2>
          <RevenueBarChart data={data.revenueByMonth} />
        </div>
        <div className="admin-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="label-caps text-muted">Recent Activity</h2>
            <Link href="/admin/logs" className="text-xs text-terra hover:text-green">
              All logs →
            </Link>
          </div>
          <ActivityFeed items={data.recentActivity} />
        </div>
      </div>

      <div className="admin-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="label-caps text-muted">Recent Orders</h2>
          <Link href="/admin/orders" className="label-caps text-terra hover:text-terra-2">
            View All →
          </Link>
        </div>
        <OrdersTable orders={data.recentOrders} compact />
      </div>
    </AdminShell>
  );
}
