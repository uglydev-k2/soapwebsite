export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import { KpiCard } from "@/components/admin/KpiCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { CategoryDonut } from "@/components/admin/CategoryDonut";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { getDashboardData } from "@/lib/dashboard";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <AdminShell title="Dashboard" breadcrumbs={[{ label: "Overview" }]}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Total Revenue"
          value={formatPrice(data.kpis.totalRevenue)}
          change={`+${data.kpis.revenueChange}% this month`}
          changeType="positive"
          progress={Math.min(data.kpis.revenueChange, 100)}
        />
        <KpiCard
          label="Orders"
          value={String(data.kpis.totalOrders)}
          change={`+${data.kpis.ordersChange} this week`}
          changeType="positive"
          progress={70}
        />
        <KpiCard
          label="Products"
          value={String(data.kpis.totalProducts)}
          change={
            data.kpis.lowStockCount > 0
              ? `${data.kpis.lowStockCount} low stock`
              : "All stocked"
          }
          changeType={data.kpis.lowStockCount > 0 ? "warning" : "positive"}
          progress={data.kpis.lowStockCount > 0 ? 40 : 90}
        />
        <KpiCard
          label="Customers"
          value={String(data.kpis.totalCustomers)}
          change={`+${data.kpis.newCustomersToday} new today`}
          changeType="positive"
          progress={60}
        />
      </div>

      {data.kpis.lowStockCount > 0 && (
        <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center justify-between">
          <span>
            {data.kpis.lowStockCount} product{data.kpis.lowStockCount > 1 ? "s are" : " is"} running
            low on stock
          </span>
          <Link href="/admin/products" className="label-caps underline">
            Review Inventory →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 admin-card p-6">
          <h2 className="label-caps text-muted mb-4">Revenue</h2>
          <RevenueChart data={data.monthlyRevenue} />
        </div>
        <div className="admin-card p-6">
          <h2 className="label-caps text-muted mb-4">By Category</h2>
          <CategoryDonut data={data.categoryBreakdown} />
        </div>
      </div>

      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="label-caps text-muted">Recent Orders</h2>
          <Link href="/admin/orders" className="label-caps text-terra hover:text-terra-2">
            View All Orders →
          </Link>
        </div>
        <OrdersTable orders={data.recentOrders} compact />
      </div>
    </AdminShell>
  );
}
