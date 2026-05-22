"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/admin", icon: "📊" },
      { label: "Analytics", href: "/admin/analytics", icon: "📈" },
    ],
  },
  {
    title: "CATALOG",
    items: [
      { label: "Products", href: "/admin/products", icon: "📦" },
      { label: "Categories", href: "/admin/products?view=categories", icon: "🏷️" },
    ],
  },
  {
    title: "COMMERCE",
    items: [
      { label: "Orders", href: "/admin/orders", icon: "🛒" },
      { label: "Customers", href: "/admin/customers", icon: "👥" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Settings", href: "/admin/settings", icon: "⚙️" },
      { label: "My Account", href: "/admin/settings#account", icon: "👤" },
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
  const { data: session } = useSession();
  const user = session?.user;
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchPending() {
      try {
        const res = await fetch("/api/orders?status=PENDING&limit=1");
        const json = (await res.json()) as ApiResponse<unknown[]>;
        if (!cancelled && res.ok) {
          setPendingOrdersCount(json.meta?.total ?? 0);
        }
      } catch {
        /* ignore — badge is non-critical */
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

  const sections = navSections.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.label === "Orders" && pendingOrdersCount > 0
        ? { ...item, badge: pendingOrdersCount }
        : item
    ),
  }));

  const sidebarContent = (
    <aside className="flex h-full w-[240px] shrink-0 flex-col bg-green-3 text-cream">
      <div className="border-b border-white/10 px-5 py-6">
        <Link href="/admin" className="block" onClick={onClose}>
          <p className="font-serif text-2xl leading-none text-cream">
            <span className="italic text-gold">Ms</span>
            <span className="text-cream">Vee</span>
          </p>
          <p className="label-caps mt-1 text-[0.65rem] tracking-[0.22em] text-cream/50">
            Admin Panel
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
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "border-l-2 border-gold bg-white/5 pl-[10px] text-cream"
                          : "border-l-2 border-transparent text-cream/70 hover:bg-white/5 hover:text-cream"
                      )}
                    >
                      <span className="text-base leading-none" aria-hidden>
                        {item.icon}
                      </span>
                      <span className="flex-1 font-sans font-normal tracking-wide">
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
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-terra font-sans text-xs font-medium text-white">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-cream">{user?.name ?? "Admin"}</p>
            <p className="truncate text-xs text-cream/50">
              {(user as { role?: string })?.role?.replace("_", " ") ?? "Editor"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
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
