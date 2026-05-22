export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });
  const admins = await prisma.adminUser.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

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
