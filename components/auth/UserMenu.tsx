"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { NavbarAuthUser } from "@/lib/navbar-auth";
import { getInitials } from "@/lib/utils";
import type { ApiResponse } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

interface UserMenuProps {
  initialUser?: NavbarAuthUser | null;
}

async function fetchAccountUser(): Promise<NavbarAuthUser | null> {
  const res = await fetch("/api/account/me", { cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as ApiResponse<NavbarAuthUser | null>;
  return json.data ?? null;
}

export function UserMenu({ initialUser = null }: UserMenuProps) {
  const router = useRouter();
  const [user, setUser] = useState<NavbarAuthUser | null>(initialUser);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    async function syncUser() {
      const accountUser = await fetchAccountUser();
      setUser(accountUser);
    }

    syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!isSupabaseConfigured()) {
      router.refresh();
      router.push("/login");
      return;
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    router.refresh();
    router.push("/login");
  };

  if (!user) {
    return (
      <Link
        href="/login"
        className="label-caps text-sm text-green transition-colors duration-250 hover:text-terra"
      >
        Sign In
      </Link>
    );
  }

  const displayName = user.full_name || user.email;
  const initials = getInitials(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-terra/40"
          aria-label="Account menu"
        >
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover border border-green/10"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center bg-green text-cream text-xs font-medium rounded-full">
              {initials}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-text truncate">{displayName}</p>
          <p className="text-xs text-muted truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        {user.isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <LayoutDashboard size={14} />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center gap-2">
            <User size={14} />
            My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Package size={14} />
            My Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-terra"
        >
          <LogOut size={14} />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
