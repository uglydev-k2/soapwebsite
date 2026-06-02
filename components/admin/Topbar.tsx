"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, ChevronRight, Menu, Plus } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopbarProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  showNewProduct?: boolean;
  onMenuToggle?: () => void;
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
  className,
}: TopbarProps) {
  const { data: session } = useSession();
  const today = formatDateTime(new Date());

  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-green/10 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between",
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

      <div className="flex items-center gap-3">
        {showNewProduct && (
          <Link href="/admin/products/new">
            <Button size="sm" className="gap-1.5">
              <Plus size={14} />
              New Product
            </Button>
          </Link>
        )}
        <button
          type="button"
          className="relative p-2 text-muted transition-colors hover:bg-cream hover:text-green"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={1.5} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 bg-terra" />
        </button>
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
