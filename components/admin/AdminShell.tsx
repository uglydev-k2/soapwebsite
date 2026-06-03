"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar, type BreadcrumbItem } from "@/components/admin/Topbar";
import {
  CommandPalette,
  useCommandPalette,
} from "@/components/admin/CommandPalette";
import { AdminSetupBanner } from "@/components/admin/AdminSetupBanner";
import { useAdminLiveUpdates } from "@/components/admin/useAdminLiveUpdates";

interface AdminShellProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  showNewProduct?: boolean;
  className?: string;
}

export function AdminShell({
  children,
  title,
  breadcrumbs,
  showNewProduct = true,
  className,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { open, openPalette, closePalette } = useCommandPalette();
  useAdminLiveUpdates(true);

  return (
    <div className="admin-shell min-h-screen bg-[#f4f1eb]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-[260px]">
        <Topbar
          title={title}
          breadcrumbs={breadcrumbs}
          showNewProduct={showNewProduct}
          onMenuToggle={() => setSidebarOpen(true)}
          onSearchOpen={openPalette}
        />

        <main className={cn("flex-1 p-4 sm:p-6", className)}>
          <AdminSetupBanner />
          {children}
        </main>
      </div>

      <CommandPalette open={open} onClose={closePalette} />
    </div>
  );
}
