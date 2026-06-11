"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Product } from "@prisma/client";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { productSchema, type ProductFormData } from "@/lib/validations";
import { cn, slugify } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ProductFormProps {
  product?: Product | null;
  className?: string;
}

export function ProductForm({ product, className }: ProductFormProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(!!product);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          category: product.category,
          stock: product.stock,
          images: product.images,
          ingredients: product.ingredients,
          fragrance: product.fragrance,
          featured: product.featured,
          active: product.active,
        }
      : {
          name: "",
          slug: "",
          description: "",
          price: 0,
          comparePrice: null,
          category: "BAR_SOAP",
          stock: 0,
          images: [],
          ingredients: "",
          fragrance: "",
          featured: false,
          active: true,
        },
  });

  const name = watch("name");
  const images = watch("images");

  useEffect(() => {
    if (!slugManual && name) {
      setValue("slug", slugify(name));
    }
  }, [name, slugManual, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Failed to save product", "error");
        return;
      }
      addToast(
        product ? "Product updated successfully" : "Product created successfully"
      );
      router.push("/admin/products");
      router.refresh();
    } catch {
      addToast("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("grid gap-8 lg:grid-cols-[1fr_320px]", className)}
    >
      <div className="space-y-8 sm:space-y-6">
        <div className="admin-card space-y-5 sm:space-y-4">
          <h2 className="font-serif text-xl font-semibold text-green">Details</h2>
          <Input
            label="Product Name"
            {...register("name")}
            error={errors.name?.message}
          />
          <div>
            <Input
              label="Slug"
              {...register("slug", {
                onChange: () => setSlugManual(true),
              })}
              error={errors.slug?.message}
            />
            <p className="mt-1 text-xs text-muted">
              URL-friendly identifier. Auto-generated from name.
            </p>
          </div>
          <div>
            <label className="label-caps mb-2 block text-muted">Description</label>
            <textarea
              {...register("description")}
              rows={5}
              className={cn(
                "admin-textarea",
                errors.description && "border-terra"
              )}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-terra">{errors.description.message}</p>
            )}
          </div>
        </div>

        <div className="admin-card space-y-5 sm:space-y-4">
          <h2 className="font-serif text-xl font-semibold text-green">Pricing & Inventory</h2>
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              {...register("price")}
              error={errors.price?.message}
            />
            <Input
              label="Compare Price ($)"
              type="number"
              step="0.01"
              {...register("comparePrice")}
              error={errors.comparePrice?.message}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-caps mb-2 block text-muted">Category</label>
              <select
                {...register("category")}
                className="admin-input w-full"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-terra">{errors.category.message}</p>
              )}
            </div>
            <Input
              label="Stock"
              type="number"
              {...register("stock")}
              error={errors.stock?.message}
            />
          </div>
        </div>

        <div className="admin-card space-y-5 sm:space-y-4">
          <h2 className="font-serif text-xl font-semibold text-green">Attributes</h2>
          <Input
            label="Fragrance"
            {...register("fragrance")}
            error={errors.fragrance?.message}
          />
          <div>
            <label className="label-caps mb-2 block text-muted">Ingredients</label>
            <textarea
              {...register("ingredients")}
              rows={3}
              className="admin-textarea"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8 sm:space-y-6">
        <div className="admin-card space-y-5 sm:space-y-4">
          <h2 className="font-serif text-xl font-semibold text-green">Images</h2>
          <ProductImageUploader
            images={images}
            onChange={(next) => setValue("images", next, { shouldValidate: true })}
          />
          {errors.images && (
            <p className="text-xs text-terra">{errors.images.message}</p>
          )}
        </div>

        <div className="admin-card space-y-5 sm:space-y-4">
          <h2 className="font-serif text-xl font-semibold text-green">Visibility</h2>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register("featured")}
              className="h-4 w-4 accent-terra"
            />
            <span className="text-sm text-text">Featured product</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register("active")}
              className="h-4 w-4 accent-terra"
            />
            <span className="text-sm text-text">Active (visible in store)</span>
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Saving…" : product ? "Update Product" : "Create Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
