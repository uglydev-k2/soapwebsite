export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import SubscriptionsPageClient from "@/components/admin/SubscriptionsPageClient";

export default function AdminSubscriptionsPage() {
  return (
    <AdminShell
      title="Subscriptions"
      breadcrumbs={[{ label: "Commerce" }, { label: "Subscriptions" }]}
      showNewProduct={false}
    >
      <SubscriptionsPageClient />
    </AdminShell>
  );
}
