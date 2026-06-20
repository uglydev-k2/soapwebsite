export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import ReviewsPageClient from "@/components/admin/ReviewsPageClient";

export default function AdminReviewsPage() {
  return (
    <AdminShell
      title="Product Reviews"
      breadcrumbs={[{ label: "Catalog" }, { label: "Reviews" }]}
      showNewProduct={false}
    >
      <ReviewsPageClient />
    </AdminShell>
  );
}
