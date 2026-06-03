"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronRight, Menu, Plus, Search } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AdminNotificationsPanel } from "@/components/admin/AdminNotificationsPanel";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopbarProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  showNewProduct?: boolean;
  onMenuToggle?: () => void;
  onSearchOpen?: () => void;
  className?: string;
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

export function Topbar({
  title,
  breadcrumbs = [],
  showNewProduct = true,
  onMenuToggle,
  onSearchOpen,
  className,
}: TopbarProps) {
  const { data: session } = useSession();
  const today = formatDateTime(new Date());

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex flex-col gap-4 border-b border-green/10 bg-white/95 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="mt-1 shrink-0 p-2 text-green transition-colors hover:bg-cream lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        )}
        <div>
          <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-muted">
            <Link href="/admin" className="transition-colors hover:text-green">
              Admin
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                <ChevronRight size={12} className="text-green/30" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-green"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-green">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="font-serif text-2xl font-semibold text-green">{title}</h1>
          <p className="mt-0.5 text-xs text-muted">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onSearchOpen}
          className="hidden items-center gap-2 border border-green/15 bg-cream/50 px-3 py-2 text-xs text-muted transition-colors hover:border-green/30 hover:text-green sm:flex"
        >
          <Search size={14} />
          <span>Search</span>
          <kbd className="ml-2 border border-green/15 bg-white px-1.5 py-0.5 text-[10px]">
            ⌘K
          </kbd>
        </button>
        <button
          type="button"
          onClick={onSearchOpen}
          className="p-2 text-muted transition-colors hover:bg-cream hover:text-green sm:hidden"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
        {showNewProduct && (
          <Link href="/admin/products/new">
            <Button size="sm" className="gap-1.5">
              <Plus size={14} />
              <span className="hidden sm:inline">New Product</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        )}
        <AdminNotificationsPanel />
        <div
          className="flex h-9 w-9 items-center justify-center bg-terra text-xs font-medium text-white"
          title={session?.user?.name ?? "Admin"}
        >
          {getInitials(session?.user?.name)}
        </div>
      </div>
    </header>
  );
}
