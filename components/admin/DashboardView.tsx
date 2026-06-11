"use client";

import Link from "next/link";
import { KpiCard } from "@/components/admin/KpiCard";
import { CategoryDonut } from "@/components/admin/CategoryDonut";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { DashboardQuickActions } from "@/components/admin/DashboardQuickActions";
import { OpsCenter } from "@/components/admin/OpsCenter";
import { SystemHealthPanel } from "@/components/admin/SystemHealthPanel";
import { FulfillmentQueue } from "@/components/admin/FulfillmentQueue";
import {
  CustomerGrowthChart,
  RevenueBarChart,
} from "@/components/admin/GrowthCharts";
import type { DashboardPermissions } from "@/lib/dashboard-widgets";
import type { AdminAlert, ServiceHealth } from "@/lib/admin-overview";
import type { getDashboardData } from "@/lib/dashboard";
import type { getPendingFulfillmentOrders } from "@/lib/admin-inventory";
import { formatPrice } from "@/lib/utils";
import type { getRecentActivity } from "@/lib/audit";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
type FulfillmentOrders = Awaited<
  ReturnType<typeof getPendingFulfillmentOrders>
>;

interface DashboardViewProps {
  permissions: DashboardPermissions;
  data: DashboardData;
  overview: {
    alerts: AdminAlert[];
    services: ServiceHealth[];
    pendingOrders: number;
    lowStockCount: number;
    flaggedProducts: number;
  };
  fulfillmentOrders: FulfillmentOrders;
}

export function DashboardView({
  permissions,
  data,
  overview,
  fulfillmentOrders,
}: DashboardViewProps) {
  const customerSparkline = data.customerGrowth.slice(-6).map((m) => m.count);
  const revenueSparkline = data.revenueSparkline;
  const kpiCount = [
    permissions.viewRevenueKpis,
    permissions.viewOrdersKpis,
    permissions.viewCustomersKpis,
  ].filter(Boolean).length;

  return (
    <>
      {permissions.viewQuickActions && <DashboardQuickActions />}

      {kpiCount > 0 && (
        <div className="mb-8 mt-6 grid grid-cols-1 gap-5 sm:mb-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {permissions.viewRevenueKpis && (
            <>
              <KpiCard
                label="Total Revenue"
                value={formatPrice(data.kpis.totalRevenue)}
                change={`${data.kpis.revenueChange >= 0 ? "+" : ""}${data.kpis.revenueChange}% vs last month`}
                changeType={
                  data.kpis.revenueChange >= 0 ? "positive" : "negative"
                }
                sparkline={revenueSparkline}
                href="/admin/billing"
              />
              <KpiCard
                label="Monthly Revenue"
                value={formatPrice(data.kpis.mrr)}
                change={`${data.kpis.totalProducts} active SKUs`}
                changeType="neutral"
                sparkline={revenueSparkline}
                href="/admin/analytics"
              />
            </>
          )}
          {permissions.viewOrdersKpis && (
            <KpiCard
              label="Orders This Week"
              value={String(data.kpis.ordersChange)}
              change={`${data.kpis.totalOrders} lifetime orders`}
              changeType="neutral"
              sparkline={data.orderSparkline}
              href="/admin/orders"
            />
          )}
          {permissions.viewCustomersKpis && (
            <KpiCard
              label="Customers"
              value={String(data.kpis.totalCustomers)}
              change={`+${data.kpis.newSignupsToday} today`}
              changeType="positive"
              sparkline={customerSparkline}
              href="/admin/customers"
            />
          )}
        </div>
      )}

      {(permissions.viewFulfillment || permissions.viewOps) && (
        <div className="mb-8 grid grid-cols-1 gap-6 sm:mb-6 xl:grid-cols-3">
          {permissions.viewFulfillment && (
            <div className={permissions.viewOps ? "xl:col-span-2" : "xl:col-span-3"}>
              <FulfillmentQueue orders={fulfillmentOrders} />
            </div>
          )}
          {permissions.viewOps && (
            <div className={permissions.viewFulfillment ? "" : "xl:col-span-3"}>
              <OpsCenter
                alerts={overview.alerts}
                pendingOrders={overview.pendingOrders}
                lowStockCount={overview.lowStockCount}
                flaggedProducts={overview.flaggedProducts}
              />
            </div>
          )}
        </div>
      )}

      {permissions.viewSystemHealth && (
        <div className="mb-6">
          <SystemHealthPanel services={overview.services} compact />
        </div>
      )}

      {permissions.viewInventoryAlert && data.kpis.lowStockCount > 0 && (
        <div className="mb-6 flex flex-col gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {data.kpis.lowStockCount} product
            {data.kpis.lowStockCount > 1 ? "s are" : " is"} running low on stock
          </span>
          <Link href="/admin/inventory" className="label-caps underline">
            Review Inventory →
          </Link>
        </div>
      )}

      {permissions.viewCharts && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="admin-card lg:col-span-2">
              <h2 className="label-caps mb-4 text-muted">
                Customer Growth (12 mo)
              </h2>
              <CustomerGrowthChart data={data.customerGrowth} />
            </div>
            <div className="admin-card">
              <h2 className="label-caps mb-4 text-muted">Catalog by Category</h2>
              <CategoryDonut data={data.categoryBreakdown} />
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="admin-card lg:col-span-2">
              <h2 className="label-caps mb-4 text-muted">Revenue by Month</h2>
              <RevenueBarChart data={data.revenueByMonth} />
            </div>
            {permissions.viewActivity && (
              <div className="admin-card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="label-caps text-muted">Recent Activity</h2>
                  <Link
                    href="/admin/logs"
                    className="text-xs text-terra hover:text-green"
                  >
                    All logs →
                  </Link>
                </div>
                <ActivityFeed
                  items={
                    data.recentActivity as Awaited<
                      ReturnType<typeof getRecentActivity>
                    >
                  }
                />
              </div>
            )}
          </div>
        </>
      )}

      {permissions.viewRecentOrders && (
        <div className="admin-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="label-caps text-muted">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="label-caps text-terra hover:text-terra-2"
            >
              View All →
            </Link>
          </div>
          <OrdersTable orders={data.recentOrders} compact />
        </div>
      )}

      {!permissions.viewCharts &&
        !permissions.viewRecentOrders &&
        permissions.viewFulfillment && (
          <p className="admin-card px-4 py-6 text-center text-sm text-muted">
            Your role focuses on fulfillment and moderation. Use the queue above
            to process orders.
          </p>
        )}
    </>
  );
}
