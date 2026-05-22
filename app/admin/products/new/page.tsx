import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <AdminShell
      title="New Product"
      breadcrumbs={[
        { label: "Catalog" },
        { label: "Products", href: "/admin/products" },
        { label: "New" },
      ]}
    >
      <ProductForm />
    </AdminShell>
  );
}
