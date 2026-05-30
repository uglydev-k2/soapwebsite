"use client";

import { formatDateTime } from "@/lib/utils";

interface ActivityItem {
  id: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: Date | string;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">No recent activity</p>
    );
  }

  return (
    <ul className="divide-y divide-green/5">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3 py-3">
          <div className="mt-1 h-2 w-2 shrink-0 bg-terra" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-text">
              <span className="text-green">{item.adminEmail.split("@")[0]}</span>{" "}
              {item.action}{" "}
              <span className="text-muted">{item.entity}</span>
              {item.entityId && (
                <span className="text-xs text-muted"> · {item.entityId.slice(0, 8)}</span>
              )}
            </p>
            <p className="text-xs text-muted">{formatDateTime(item.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
