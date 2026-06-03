export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import { InventoryPageClient } from "@/components/admin/InventoryPageClient";
import {
  getLowStockProducts,
  LOW_STOCK_THRESHOLD,
} from "@/lib/admin-inventory";

export default async function AdminInventoryPage() {
  const products = await getLowStockProducts();

  return (
    <AdminShell
      title="Inventory"
      breadcrumbs={[
        { label: "Catalog", href: "/admin/products" },
        { label: "Inventory" },
      ]}
      showNewProduct={false}
    >
      <InventoryPageClient
        products={products}
        threshold={LOW_STOCK_THRESHOLD}
      />
    </AdminShell>
  );
}
