export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getAdminSettings } from "@/lib/admin-data";

export default async function AdminSettingsPage() {
  const { settings, admins } = await getAdminSettings();

  return (
    <AdminShell
      title="Settings"
      breadcrumbs={[{ label: "System" }, { label: "Settings" }]}
      showNewProduct={false}
    >
      <SettingsForm
        settings={settings}
        admins={admins.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
          role: String(a.role),
        }))}
      />
    </AdminShell>
  );
}
