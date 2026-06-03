import { hasPermission } from "@/lib/rbac";

export type DashboardPermissions = {
  viewRevenueKpis: boolean;
  viewOrdersKpis: boolean;
  viewCustomersKpis: boolean;
  viewFulfillment: boolean;
  viewOps: boolean;
  viewSystemHealth: boolean;
  viewCharts: boolean;
  viewActivity: boolean;
  viewRecentOrders: boolean;
  viewInventoryAlert: boolean;
  viewQuickActions: boolean;
};

export function getDashboardPermissions(
  role: string | undefined
): DashboardPermissions {
  return {
    viewQuickActions: hasPermission(role, "dashboard:read"),
    viewRevenueKpis:
      hasPermission(role, "analytics:read") ||
      hasPermission(role, "billing:read"),
    viewOrdersKpis: hasPermission(role, "orders:read"),
    viewCustomersKpis: hasPermission(role, "customers:read"),
    viewFulfillment: hasPermission(role, "orders:read"),
    viewOps:
      hasPermission(role, "orders:read") ||
      hasPermission(role, "products:read") ||
      hasPermission(role, "content:read"),
    viewSystemHealth: hasPermission(role, "settings:read"),
    viewCharts: hasPermission(role, "analytics:read"),
    viewActivity: hasPermission(role, "logs:read"),
    viewRecentOrders: hasPermission(role, "orders:read"),
    viewInventoryAlert: hasPermission(role, "products:read"),
  };
}
