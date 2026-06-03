"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminAlert } from "@/lib/admin-overview";
import type { ApiResponse } from "@/types";

type OverviewData = {
  alerts: AdminAlert[];
  pendingOrders: number;
  lowStockCount: number;
};

interface AdminNotificationsPanelProps {
  className?: string;
}

const severityIcon = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const severityStyles = {
  critical: "text-terra bg-terra/10",
  warning: "text-amber-700 bg-amber-50",
  info: "text-green bg-green/10",
};

export function AdminNotificationsPanel({
  className,
}: AdminNotificationsPanelProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<OverviewData | null>(null);
  const [livePending, setLivePending] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overview");
      const json = (await res.json()) as ApiResponse<OverviewData>;
      if (res.ok && json.data) {
        setData(json.data);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const onLive = (event: Event) => {
      const detail = (event as CustomEvent<{ pendingOrders: number }>).detail;
      if (detail?.pendingOrders != null) {
        setLivePending(detail.pendingOrders);
      }
      load();
    };
    window.addEventListener("admin-live-update", onLive);
    return () => window.removeEventListener("admin-live-update", onLive);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const alertCount = data?.alerts.length ?? 0;
  const pendingDisplay = livePending ?? data?.pendingOrders;

  return (
    <div className={cn("relative", className)} ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-muted transition-colors hover:bg-cream hover:text-green"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={18} strokeWidth={1.5} />
        {alertCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center bg-terra px-1 text-[9px] font-medium text-white">
            {alertCount > 9 ? "9+" : alertCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 border border-green/10 bg-white shadow-xl">
          <div className="border-b border-green/10 px-4 py-3">
            <p className="label-caps text-muted">Live Operations</p>
            {pendingDisplay != null && (
              <p className="mt-1 text-xs text-muted">
                {pendingDisplay} pending order{pendingDisplay === 1 ? "" : "s"}{" "}
                · updates every 20s
              </p>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {!data ? (
              <p className="px-3 py-6 text-center text-sm text-muted">
                Loading…
              </p>
            ) : data.alerts.length === 0 ? (
              <div className="flex flex-col items-center px-3 py-8 text-center">
                <CheckCircle2 size={24} className="mb-2 text-green" />
                <p className="text-sm text-green">All clear</p>
                <p className="mt-1 text-xs text-muted">No pending alerts</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {data.alerts.map((alert) => {
                  const Icon = severityIcon[alert.severity];
                  return (
                    <li key={alert.id}>
                      <Link
                        href={alert.href}
                        onClick={() => setOpen(false)}
                        className="flex gap-3 px-3 py-2.5 transition-colors hover:bg-cream"
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center",
                            severityStyles[alert.severity]
                          )}
                        >
                          <Icon size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-green">
                            {alert.title}
                          </span>
                          <span className="block text-xs text-muted">
                            {alert.description}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-green/10 px-4 py-2">
            <Link
              href="/admin/orders?status=PENDING"
              onClick={() => setOpen(false)}
              className="text-xs text-terra hover:text-green"
            >
              Pending orders →
            </Link>
            <Link
              href="/admin/system"
              onClick={() => setOpen(false)}
              className="text-xs text-muted hover:text-green"
            >
              System health
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
