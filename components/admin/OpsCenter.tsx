import Link from "next/link";
import type { AdminAlert } from "@/lib/admin-overview";
import { cn } from "@/lib/utils";

interface OpsCenterProps {
  alerts: AdminAlert[];
  pendingOrders: number;
  lowStockCount: number;
  flaggedProducts: number;
}

export function OpsCenter({
  alerts,
  pendingOrders,
  lowStockCount,
  flaggedProducts,
}: OpsCenterProps) {
  const tiles = [
    {
      label: "Pending Orders",
      value: pendingOrders,
      href: "/admin/orders?status=PENDING",
      urgent: pendingOrders > 0,
    },
    {
      label: "Low Stock",
      value: lowStockCount,
      href: "/admin/inventory",
      urgent: lowStockCount > 0,
    },
    {
      label: "Flagged Items",
      value: flaggedProducts,
      href: "/admin/content?status=FLAGGED",
      urgent: flaggedProducts > 0,
    },
  ];

  return (
    <div className="admin-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="label-caps text-muted">Operations Center</h2>
        <Link href="/admin/orders" className="text-xs text-terra hover:text-green">
          Fulfillment →
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className={cn(
              "border px-4 py-4 text-center transition-colors hover:bg-cream",
              tile.urgent
                ? "border-terra/30 bg-terra/5"
                : "border-green/10 bg-white"
            )}
          >
            <p
              className={cn(
                "font-serif text-3xl font-semibold",
                tile.urgent ? "text-terra" : "text-green"
              )}
            >
              {tile.value}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">
              {tile.label}
            </p>
          </Link>
        ))}
      </div>

      {alerts.length > 0 ? (
        <ul className="space-y-2">
          {alerts.slice(0, 4).map((alert) => (
            <li key={alert.id}>
              <Link
                href={alert.href}
                className="flex flex-col gap-1 border border-green/10 bg-cream/50 px-4 py-3 text-sm transition-colors hover:bg-cream sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-green">{alert.title}</span>
                <span className="text-xs text-muted sm:max-w-[50%] sm:text-right">
                  {alert.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border border-green/10 bg-green/5 px-4 py-3 text-sm text-green">
          All systems nominal — no urgent actions required.
        </p>
      )}
    </div>
  );
}
