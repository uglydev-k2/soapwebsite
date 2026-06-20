import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserProfile, getNavbarAuthUser } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCustomerOrderSummaries } from "@/lib/customer-orders";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — mvlusciouslather",
};

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const { user, profile } = await getCurrentUserProfile();
  const authUser = await getNavbarAuthUser();

  if (!user) {
    redirect("/login");
  }

  const name = profile?.full_name || user.email?.split("@")[0] || "there";
  const isAdmin = authUser?.isAdmin ?? false;
  const orders = user.email
    ? await getCustomerOrderSummaries(user.id, user.email)
    : [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-serif text-4xl text-green mb-2">
        Welcome, {name}
      </h1>
      <p className="text-muted mb-10">
        Your personal mvlusciouslather dashboard.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {isAdmin && (
          <div className="admin-card border border-terra/20 bg-terra/5 sm:col-span-2">
            <p className="label-caps text-muted mb-2">Admin</p>
            <Link
              href="/admin"
              className="text-terra hover:text-terra-2 font-medium"
            >
              Open Admin Dashboard →
            </Link>
          </div>
        )}
        <div className="admin-card">
          <p className="label-caps text-muted mb-2">Account</p>
          <p className="text-text">{profile?.email ?? user.email}</p>
          {profile?.created_at && (
            <p className="text-sm text-muted mt-2">
              Member since {formatDate(profile.created_at)}
            </p>
          )}
        </div>
        <div className="admin-card">
          <p className="label-caps text-muted mb-2">Quick Links</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/collections" className="text-terra hover:text-terra-2">
                Browse collections
              </Link>
            </li>
            <li>
              <Link href="/account" className="text-terra hover:text-terra-2">
                Manage account
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-terra hover:text-terra-2">
                View cart
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="admin-card mt-8">
          <p className="label-caps text-muted mb-4">Recent Orders</p>
          <ul className="space-y-4">
            {orders.slice(0, 8).map((order) => (
              <li
                key={order.orderNumber}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-green/10 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-green">{order.orderNumber}</p>
                  <p className="text-sm text-muted">
                    {formatDate(order.createdAt)} · {order.status}
                  </p>
                  {order.trackingNumber && (
                    <p className="text-sm mt-1">
                      {order.trackingUrl ? (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-terra hover:text-terra-2"
                        >
                          Track {order.trackingNumber}
                        </a>
                      ) : (
                        <span className="text-muted">Tracking: {order.trackingNumber}</span>
                      )}
                    </p>
                  )}
                </div>
                <p className="font-serif text-green">{formatPrice(order.total)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
