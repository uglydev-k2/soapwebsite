import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — MsVee Soaps",
};

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/login");
  }

  const name = profile?.full_name || user.email?.split("@")[0] || "there";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-serif text-4xl text-green mb-2">
        Welcome, {name}
      </h1>
      <p className="text-muted mb-10">
        Your personal MsVee Soaps dashboard.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
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
    </div>
  );
}
