export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import LogsPageClient from "@/components/admin/LogsPageClient";

export default function AdminLogsPage() {
  return (
    <AdminShell
      title="Audit Logs"
      breadcrumbs={[{ label: "System" }, { label: "Logs" }]}
      showNewProduct={false}
    >
      <LogsPageClient />
    </AdminShell>
  );
}
