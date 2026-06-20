export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import PromoCodesPageClient from "@/components/admin/PromoCodesPageClient";

export default function AdminPromoCodesPage() {
  return (
    <AdminShell
      title="Promo Codes"
      breadcrumbs={[{ label: "Commerce" }, { label: "Promo Codes" }]}
      showNewProduct={false}
    >
      <PromoCodesPageClient />
    </AdminShell>
  );
}
