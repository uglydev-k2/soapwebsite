import { AdminShell } from "@/components/admin/AdminShell";
import AnalyticsPageClient from "@/components/admin/AnalyticsPageClient";

export default function AdminAnalyticsPage() {
  return (
    <AdminShell
      title="Analytics"
      breadcrumbs={[{ label: "Overview" }, { label: "Analytics" }]}
      showNewProduct={false}
    >
      <AnalyticsPageClient />
    </AdminShell>
  );
}
