export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return (
    <AdminShell
      title="Edit Product"
      breadcrumbs={[
        { label: "Catalog" },
        { label: "Products", href: "/admin/products" },
        { label: product.name },
      ]}
    >
      <ProductForm product={product} />
    </AdminShell>
  );
}
