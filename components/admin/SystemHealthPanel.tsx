import type { ServiceHealth } from "@/lib/admin-overview";
import { cn } from "@/lib/utils";

interface SystemHealthPanelProps {
  services: ServiceHealth[];
  compact?: boolean;
}

const statusDot = {
  ok: "bg-green",
  degraded: "bg-gold",
  offline: "bg-terra",
};

const statusLabel = {
  ok: "Operational",
  degraded: "Degraded",
  offline: "Offline",
};

export function SystemHealthPanel({
  services,
  compact = false,
}: SystemHealthPanelProps) {
  const overall = services.some((s) => s.status === "offline")
    ? "offline"
    : services.some((s) => s.status === "degraded")
      ? "degraded"
      : "ok";

  return (
    <div className={cn("admin-card", compact ? "p-4" : "p-6")}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="label-caps text-muted">System Health</h2>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs",
            overall === "ok" ? "text-green" : overall === "degraded" ? "text-gold" : "text-terra"
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", statusDot[overall])} />
          {statusLabel[overall]}
        </span>
      </div>

      <ul className="space-y-2">
        {services.map((service) => (
          <li
            key={service.id}
            className="flex flex-col gap-1 border border-green/10 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn("h-2 w-2 shrink-0 rounded-full", statusDot[service.status])}
              />
              <span className="text-sm text-green">{service.label}</span>
            </div>
            <span className="text-xs text-muted sm:max-w-[55%] sm:truncate sm:text-right">
              {service.detail}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
