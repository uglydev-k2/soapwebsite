export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import ContentPageClient from "@/components/admin/ContentPageClient";

export default function AdminContentPage() {
  return (
    <AdminShell
      title="Content Moderation"
      breadcrumbs={[{ label: "Catalog" }, { label: "Content" }]}
      showNewProduct={false}
    >
      <ContentPageClient />
    </AdminShell>
  );
}
