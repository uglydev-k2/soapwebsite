"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface LogEntry {
  id: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
}

export default function LogsPageClient() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [entity, setEntity] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (entity) params.set("entity", entity);
    fetch(`/api/admin/logs?${params}`)
      .then((r) => r.json())
      .then((res) => {
        setLogs(res.data ?? []);
        setLoading(false);
      });
  };

  useEffect(load, [entity]);

  const exportCsv = () => {
    const header = "Date,Admin,Role,Action,Entity,EntityId\n";
    const rows = logs
      .map(
        (l) =>
          `"${l.createdAt}","${l.adminEmail}","${l.adminRole}","${l.action}","${l.entity}","${l.entityId ?? ""}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
  };

  if (loading) {
    return <div className="animate-pulse space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-cream-2" />)}</div>;
  }

  return (
    <div>
      <div className="mb-4 flex gap-3">
        <select className="admin-input max-w-[180px]" value={entity} onChange={(e) => setEntity(e.target.value)}>
          <option value="">All Entities</option>
          <option value="Product">Product</option>
          <option value="Order">Order</option>
          <option value="Customer">Customer</option>
          <option value="AdminUser">Admin User</option>
          <option value="Announcement">Announcement</option>
        </select>
        <Button size="sm" variant="ghost" onClick={exportCsv}>Export CSV</Button>
      </div>

      <DataTable
        data={logs}
        keyExtractor={(l) => l.id}
        columns={[
          { key: "createdAt", header: "When", render: (l) => formatDateTime(l.createdAt) },
          { key: "admin", header: "Admin", render: (l) => (
            <div><p>{l.adminEmail}</p><p className="text-xs text-muted">{l.adminRole}</p></div>
          )},
          { key: "action", header: "Action", render: (l) => l.action },
          { key: "entity", header: "Entity", render: (l) => `${l.entity}${l.entityId ? ` · ${l.entityId.slice(0, 8)}` : ""}` },
        ]}
      />
    </div>
  );
}
