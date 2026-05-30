export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import ProductsPageClient from "@/components/admin/ProductsPageClient";
import { getAdminProducts } from "@/lib/admin-data";
import type { Prisma } from "@prisma/client";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; status?: string; view?: string };
}) {
  const where: Prisma.ProductWhereInput = {};
  if (searchParams.category) where.category = searchParams.category as Prisma.ProductWhereInput["category"];
  if (searchParams.status === "active") where.active = true;
  if (searchParams.status === "inactive") where.active = false;
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { slug: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  const products = await getAdminProducts(where);

  return (
    <AdminShell
      title="Products"
      breadcrumbs={[{ label: "Catalog" }, { label: "Products" }]}
    >
      <ProductsPageClient
        products={products}
        initialView={searchParams.view || "grid"}
      />
    </AdminShell>
  );
}
