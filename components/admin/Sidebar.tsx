"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Activity,
  BarChart3,
  Bell,
  CreditCard,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  ScrollText,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasPermission, type Permission } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ApiResponse, AdminSession } from "@/types";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  permission?: Permission;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "dashboard:read" },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "analytics:read" },
      { label: "System", href: "/admin/system", icon: Activity, permission: "dashboard:read" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: Package, permission: "products:read" },
      { label: "Content", href: "/admin/content", icon: FileText, permission: "content:read" },
    ],
  },
  {
    title: "Commerce",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart, permission: "orders:read" },
      { label: "Customers", href: "/admin/customers", icon: Users, permission: "customers:read" },
      { label: "Billing", href: "/admin/billing", icon: CreditCard, permission: "billing:read" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Admin Users", href: "/admin/users", icon: Shield, permission: "users:read" },
      { label: "Notifications", href: "/admin/notifications", icon: Bell, permission: "notifications:write" },
      { label: "Audit Logs", href: "/admin/logs", icon: ScrollText, permission: "logs:read" },
      { label: "Settings", href: "/admin/settings", icon: Settings, permission: "settings:read" },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function getInitials(name?: string | null): string {
  if (!name) return "A";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: nextAuthSession } = useSession();
  const [supabaseAdmin, setSupabaseAdmin] = useState<AdminSession | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchAdminSession() {
      try {
        const res = await fetch("/api/admin/me");
        const json = (await res.json()) as ApiResponse<AdminSession | null>;
        if (!cancelled && res.ok && json.data) {
          setSupabaseAdmin(json.data);
        }
      } catch {
        /* ignore */
      }
    }
    fetchAdminSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const nextAuthUser = nextAuthSession?.user;
  const nextAuthRole = (nextAuthUser as { role?: string } | undefined)?.role;

  const displayName =
    nextAuthUser?.name ??
    supabaseAdmin?.name ??
    supabaseAdmin?.email ??
    "Admin";
  const role = nextAuthRole ?? supabaseAdmin?.role;
  const authSource = nextAuthRole ? "nextauth" : supabaseAdmin?.source;

  useEffect(() => {
    let cancelled = false;
    async function fetchPending() {
      try {
        const res = await fetch("/api/admin/overview");
        const json = (await res.json()) as ApiResponse<{ pendingOrders: number }>;
        if (!cancelled && res.ok && json.data) {
          setPendingOrdersCount(json.data.pendingOrders);
        }
      } catch {
        /* ignore */
      }
    }
    fetchPending();
    const interval = setInterval(fetchPending, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    const base = href.split("?")[0].split("#")[0];
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  const sections = navSections
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => !item.permission || hasPermission(role, item.permission))
        .map((item) =>
          item.label === "Orders" && pendingOrdersCount > 0
            ? { ...item, badge: pendingOrdersCount }
            : item
        ),
    }))
    .filter((section) => section.items.length > 0);

  const sidebarContent = (
    <aside className="admin-sidebar flex h-full w-[260px] shrink-0 flex-col">
      <div className="border-b border-white/10 px-5 py-6">
        <Link href="/admin" className="block" onClick={onClose}>
          <p className="font-serif text-2xl leading-none text-cream">
            <span className="italic text-gold">Ms</span>
            <span className="text-cream">Vee</span>
          </p>
          <p className="label-caps mt-1 text-[0.65rem] tracking-[0.22em] text-cream/50">
            Command Center
          </p>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="label-caps mb-2 px-2 text-[0.6rem] text-cream/40">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "border-l-2 border-gold bg-white/8 pl-[10px] text-cream"
                          : "border-l-2 border-transparent text-cream/70 hover:bg-white/5 hover:text-cream"
                      )}
                    >
                      <Icon size={16} strokeWidth={1.5} className="shrink-0 opacity-80" />
                      <span className="flex-1 font-sans tracking-wide">
                        {item.label}
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center bg-terra px-1.5 text-[10px] font-medium text-white">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          target="_blank"
          onClick={onClose}
          className="mb-3 flex items-center gap-2 px-2 py-2 text-xs text-cream/60 transition-colors hover:text-gold"
        >
          <ExternalLink size={14} />
          View storefront
        </Link>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-terra font-sans text-xs font-medium text-white">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-cream">{displayName}</p>
            <p className="truncate text-xs text-cream/50">
              {role?.replace(/_/g, " ") ?? "Admin"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (authSource === "supabase" && isSupabaseConfigured()) {
              try {
                const supabase = createClient();
                await supabase.auth.signOut();
              } catch {
                /* ignore */
              }
              window.location.href = "/";
              return;
            }
            signOut({ callbackUrl: "/admin/login" });
          }}
          className="flex w-full items-center justify-center gap-2 border border-white/15 px-3 py-2 text-xs text-cream/70 transition-colors hover:border-gold/40 hover:text-cream"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        {sidebarContent}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-4 z-10 text-cream/70 hover:text-cream lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
