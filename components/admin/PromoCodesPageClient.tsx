"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { promoCodeSchema } from "@/lib/validations";
import type { z } from "zod";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate, formatPrice } from "@/lib/utils";

type PromoCode = {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minSubtotal: number | null;
  active: boolean;
  usedCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  createdAt: string;
};

type FormData = z.infer<typeof promoCodeSchema>;

export default function PromoCodesPageClient() {
  const addToast = useToastStore((s) => s.addToast);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: "",
      discountType: "PERCENT",
      discountValue: 10,
      active: true,
    },
  });

  const load = useCallback(() => {
    fetch("/api/admin/promo-codes")
      .then((r) => r.json())
      .then((res) => setCodes(res.data ?? []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      addToast(json.error ?? "Could not create promo code", "error");
      return;
    }
    addToast("Promo code created");
    reset();
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch("/api/admin/promo-codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    load();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit(onSubmit)} className="admin-card space-y-4">
        <h2 className="font-serif text-2xl text-green">Create Promo Code</h2>
        <Input label="Code" error={errors.code?.message} {...register("code")} />
        <div>
          <label className="label-caps mb-2 block text-muted">Discount type</label>
          <select className="admin-input w-full" {...register("discountType")}>
            <option value="PERCENT">Percent off</option>
            <option value="FIXED">Fixed amount off</option>
          </select>
        </div>
        <Input
          label="Discount value"
          type="number"
          step="0.01"
          error={errors.discountValue?.message}
          {...register("discountValue")}
        />
        <Input
          label="Minimum subtotal (optional)"
          type="number"
          step="0.01"
          {...register("minSubtotal")}
        />
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          Create Code
        </Button>
      </form>

      <div className="admin-card">
        <h2 className="font-serif text-2xl text-green mb-4">Active Codes</h2>
        {codes.length === 0 ? (
          <p className="text-sm text-muted">No promo codes yet.</p>
        ) : (
          <ul className="space-y-4">
            {codes.map((code) => (
              <li key={code.id} className="border-b border-green/10 pb-4 last:border-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-green">{code.code}</p>
                    <p className="text-sm text-muted">
                      {code.discountType === "PERCENT"
                        ? `${code.discountValue}% off`
                        : `${formatPrice(code.discountValue)} off`}
                      {code.minSubtotal ? ` · min ${formatPrice(code.minSubtotal)}` : ""}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Used {code.usedCount}
                      {code.maxUses ? ` / ${code.maxUses}` : ""} · Created {formatDate(code.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleActive(code.id, !code.active)}
                    className="text-xs text-terra hover:underline"
                  >
                    {code.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
