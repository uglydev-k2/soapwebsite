"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store/toastStore";

export function PromoCodeField({
  subtotal,
  onApplied,
  onClear,
}: {
  subtotal: number;
  onApplied: (discount: number, code: string) => void;
  onClear: () => void;
}) {
  const addToast = useToastStore((s) => s.addToast);
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Invalid promo code", "error");
        return;
      }
      const discount = json.data.discountAmount as number;
      setAppliedCode(json.data.code as string);
      onApplied(discount, json.data.code as string);
      addToast(`Promo code ${json.data.code} applied`);
    } catch {
      addToast("Could not validate promo code", "error");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setAppliedCode(null);
    setCode("");
    onClear();
  };

  return (
    <div className="border border-green/10 bg-white p-4">
      <p className="label-caps mb-3 text-muted">Promo Code</p>
      {appliedCode ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-green">{appliedCode} applied</span>
          <button type="button" onClick={clear} className="text-terra hover:underline">
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="flex-1"
          />
          <Button type="button" variant="outline" disabled={loading} onClick={apply}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
