export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import NotificationsPageClient from "@/components/admin/NotificationsPageClient";

export default function AdminNotificationsPage() {
  return (
    <AdminShell
      title="Notifications"
      breadcrumbs={[{ label: "System" }, { label: "Notifications" }]}
      showNewProduct={false}
    >
      <NotificationsPageClient />
    </AdminShell>
  );
}
