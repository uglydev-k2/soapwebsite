"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar, type BreadcrumbItem } from "@/components/admin/Topbar";

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

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-[240px]">
        <Topbar
          title={title}
          breadcrumbs={breadcrumbs}
          showNewProduct={showNewProduct}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className={cn("flex-1 p-6", className)}>{children}</main>
      </div>
    </div>
  );
}
