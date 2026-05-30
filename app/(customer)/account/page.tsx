import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserProfile, getNavbarAuthUser } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account — MsVee Soaps",
};

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const [{ user, profile }, authUser] = await Promise.all([
    getCurrentUserProfile(),
    getNavbarAuthUser(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Account";
  const initials = getInitials(displayName);
  const isAdmin = authUser?.isAdmin ?? false;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-serif text-4xl text-green mb-8">Account</h1>

      <div className="admin-card mb-8">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-16 w-16 rounded-full object-cover border border-green/10"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center bg-green text-cream text-lg font-medium rounded-full">
              {initials}
            </span>
          )}
          <div>
            <p className="font-serif text-xl text-green">{displayName}</p>
            <p className="text-sm text-muted">{profile?.email ?? user.email}</p>
            <p className="text-xs text-muted mt-1 capitalize">
              Role: {authUser?.role ?? profile?.role ?? "user"}
            </p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="admin-card mb-8 border border-terra/20 bg-terra/5">
          <h2 className="font-serif text-2xl text-green mb-2">Admin Access</h2>
          <p className="text-sm text-muted mb-4">
            You have admin permissions for MsVee Soaps.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center bg-terra px-6 py-3 text-sm label-caps text-white transition-colors hover:bg-terra-2"
          >
            Open Admin Dashboard
          </Link>
        </div>
      )}

      <section id="settings" className="admin-card">
        <h2 className="font-serif text-2xl text-green mb-4">Settings</h2>
        <p className="text-sm text-muted mb-4">
          Profile editing will be available soon. For now, manage your password
          via{" "}
          <Link href="/forgot-password" className="text-terra hover:text-terra-2">
            password reset
          </Link>
          .
        </p>
        <Link
          href="/dashboard"
          className="text-sm text-terra hover:text-terra-2 transition-colors"
        >
          Back to dashboard
        </Link>
      </section>
    </div>
  );
}
