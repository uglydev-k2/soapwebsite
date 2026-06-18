"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ProductScentOptionFormData } from "@/lib/validations";

function ScentStockInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (stock: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <Input
      label="Stock for this scent"
      type="number"
      min={0}
      inputMode="numeric"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        const parsed = Number.parseInt(draft, 10);
        const next = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
        setDraft(String(next));
        onChange(next);
      }}
    />
  );
}

function emptyScentOption(sortOrder: number): ProductScentOptionFormData {
  return {
    label: "",
    fragrance: "",
    stock: 0,
    images: [],
    sortOrder,
    active: true,
  };
}

export function ProductScentOptionsEditor({
  options,
  onChange,
}: {
  options: ProductScentOptionFormData[];
  onChange: (options: ProductScentOptionFormData[]) => void;
}) {
  const updateOption = (
    index: number,
    patch: Partial<ProductScentOptionFormData>
  ) => {
    onChange(
      options.map((option, i) => (i === index ? { ...option, ...patch } : option))
    );
  };

  const removeOption = (index: number) => {
    onChange(
      options
        .filter((_, i) => i !== index)
        .map((option, i) => ({ ...option, sortOrder: i }))
    );
  };

  return (
    <div className="admin-card space-y-5 sm:space-y-4">
      <div>
        <h2 className="font-serif text-xl font-semibold text-green">Scent Options</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Add scent varieties the same way you would colour options — one product,
          multiple choices. The first photo on each scent is its swatch image on the
          storefront.
        </p>
      </div>

      {options.length === 0 ? (
        <p className="rounded border border-green/10 bg-cream/40 px-4 py-3 text-sm text-muted">
          No scent options yet. Use the product images above for single-scent items, or
          add scents here for variety.
        </p>
      ) : null}

      <div className="space-y-6">
        {options.map((option, index) => (
          <div
            key={option.id ?? `new-${index}`}
            className="space-y-4 border border-green/10 bg-cream/20 p-4"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="label-caps text-terra">Scent {index + 1}</p>
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="inline-flex items-center gap-1 text-xs text-terra hover:text-green"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Scent name"
                placeholder="e.g. Vanilla, Beetroot Lemon"
                value={option.label}
                onChange={(event) =>
                  updateOption(index, { label: event.target.value })
                }
              />
              <Input
                label="Fragrance notes"
                placeholder="e.g. Fruity · Floral"
                value={option.fragrance ?? ""}
                onChange={(event) =>
                  updateOption(index, { fragrance: event.target.value })
                }
              />
            </div>

            <ScentStockInput
              value={option.stock}
              onChange={(stock) => updateOption(index, { stock })}
            />

            <div>
              <p className="label-caps mb-2 block text-muted">
                Scent photos (1st = hero for this scent)
              </p>
              <ProductImageUploader
                images={option.images}
                onChange={(images) => updateOption(index, { images })}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={() => onChange([...options, emptyScentOption(options.length)])}
      >
        <Plus size={16} />
        Add scent
      </Button>
    </div>
  );
}
