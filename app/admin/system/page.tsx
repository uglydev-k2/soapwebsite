export const dynamic = "force-dynamic";

import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { SystemHealthPanel } from "@/components/admin/SystemHealthPanel";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { getAdminOverview } from "@/lib/admin-overview";
import { getRecentActivity } from "@/lib/audit";
import {
  getMissingProductionEnv,
  OPTIONAL_ENV,
  REQUIRED_PRODUCTION_ENV,
} from "@/lib/env";

export default async function AdminSystemPage() {
  const [overview, recentActivity] = await Promise.all([
    getAdminOverview(),
    getRecentActivity(15),
  ]);

  const missingRequired = getMissingProductionEnv();
  const allEnvKeys = [...REQUIRED_PRODUCTION_ENV, ...OPTIONAL_ENV];
  const envStatus = allEnvKeys.map((key) => ({
    key,
    configured: Boolean(process.env[key]?.trim()),
    required: (REQUIRED_PRODUCTION_ENV as readonly string[]).includes(key),
  }));

  return (
    <AdminShell
      title="System Health"
      breadcrumbs={[
        { label: "Overview", href: "/admin" },
        { label: "System" },
      ]}
      showNewProduct={false}
    >
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SystemHealthPanel services={overview.services} />
        <div className="admin-card p-6">
          <h2 className="label-caps mb-4 text-muted">Environment Variables</h2>
          <ul className="space-y-2">
            {envStatus.map((item) => (
              <li
                key={item.key}
                className="flex items-center justify-between border border-green/10 px-3 py-2 text-sm"
              >
                <span>
                  <code className="text-xs text-green">{item.key}</code>
                  {item.required && (
                    <span className="ml-2 text-[10px] uppercase text-terra">
                      required
                    </span>
                  )}
                </span>
                <span
                  className={
                    item.configured ? "text-green text-xs" : "text-terra text-xs"
                  }
                >
                  {item.configured ? "Set" : "Missing"}
                </span>
              </li>
            ))}
          </ul>
          {missingRequired.length > 0 && (
            <p className="mt-4 border border-terra/20 bg-terra/5 px-3 py-2 text-xs text-terra">
              Required in production: {missingRequired.join(", ")}. Add these in
              your Vercel project settings.
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="admin-card p-5 text-center">
          <p className="font-serif text-3xl font-semibold text-green">
            {overview.newsletterSubscribers}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted">
            Newsletter subscribers
          </p>
          <Link
            href="/admin/content"
            className="mt-3 inline-block text-xs text-terra hover:text-green"
          >
            View in Content →
          </Link>
        </div>
        <div className="admin-card p-5 text-center">
          <p className="font-serif text-3xl font-semibold text-green">
            {overview.pendingOrders}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted">
            Pending orders
          </p>
          <Link
            href="/admin/orders?status=PENDING"
            className="mt-3 inline-block text-xs text-terra hover:text-green"
          >
            Fulfill →
          </Link>
        </div>
        <div className="admin-card p-5 text-center">
          <p className="font-serif text-3xl font-semibold text-green">
            {overview.lowStockCount}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted">
            Low stock SKUs
          </p>
          <Link
            href="/admin/products"
            className="mt-3 inline-block text-xs text-terra hover:text-green"
          >
            Restock →
          </Link>
        </div>
      </div>

      <div className="admin-card p-6">
        <h2 className="label-caps mb-4 text-muted">Recent Admin Activity</h2>
        <ActivityFeed items={recentActivity} />
      </div>
    </AdminShell>
  );
}
