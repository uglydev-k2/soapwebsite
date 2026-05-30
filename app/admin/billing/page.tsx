export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import BillingPageClient from "@/components/admin/BillingPageClient";

export default function AdminBillingPage() {
  return (
    <AdminShell
      title="Billing & Revenue"
      breadcrumbs={[{ label: "Commerce" }, { label: "Billing" }]}
      showNewProduct={false}
    >
      <BillingPageClient />
    </AdminShell>
  );
}
