export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import UsersPageClient from "@/components/admin/UsersPageClient";

export default function AdminUsersPage() {
  return (
    <AdminShell
      title="Admin Users"
      breadcrumbs={[{ label: "System" }, { label: "Users" }]}
      showNewProduct={false}
    >
      <UsersPageClient />
    </AdminShell>
  );
}
