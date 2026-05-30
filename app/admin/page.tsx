export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import { KpiCard } from "@/components/admin/KpiCard";
import { CategoryDonut } from "@/components/admin/CategoryDonut";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import {
  CustomerGrowthChart,
  RevenueBarChart,
} from "@/components/admin/GrowthCharts";
import { getDashboardData } from "@/lib/dashboard";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <AdminShell title="Dashboard" breadcrumbs={[{ label: "Overview" }]}>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Customers"
          value={String(data.kpis.totalCustomers)}
          change={`+${data.kpis.newSignupsToday} today`}
          changeType="positive"
          progress={65}
        />
        <KpiCard
          label="Active (30 days)"
          value={String(data.kpis.activeCustomers)}
          change="Engaged shoppers"
          changeType="positive"
          progress={55}
        />
        <KpiCard
          label="Total Revenue"
          value={formatPrice(data.kpis.totalRevenue)}
          change={`+${data.kpis.revenueChange}% this month`}
          changeType={data.kpis.revenueChange >= 0 ? "positive" : "negative"}
          progress={Math.min(Math.abs(data.kpis.revenueChange), 100)}
        />
        <KpiCard
          label="MRR"
          value={formatPrice(data.kpis.mrr)}
          change={`${data.kpis.totalOrders} total orders`}
          changeType="neutral"
          progress={70}
        />
      </div>

      {data.kpis.lowStockCount > 0 && (
        <div className="mb-6 flex items-center justify-between border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
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
          <h2 className="label-caps mb-4 text-muted">By Category</h2>
          <CategoryDonut data={data.categoryBreakdown} />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="admin-card p-6 lg:col-span-2">
          <h2 className="label-caps mb-4 text-muted">Revenue by Month</h2>
          <RevenueBarChart data={data.revenueByMonth} />
        </div>
        <div className="admin-card p-6">
          <h2 className="label-caps mb-4 text-muted">Recent Activity</h2>
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
