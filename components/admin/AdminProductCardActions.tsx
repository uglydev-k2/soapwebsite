"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export function AdminProductCardActions({
  productId,
  active,
  onDelete,
}: {
  productId: string;
  active: boolean;
  onDelete: () => void;
}) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  const toggleActive = async (next: boolean) => {
    await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    addToast(next ? "Product activated" : "Product deactivated", "info");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => void toggleActive(e.target.checked)}
        />
        Active
      </label>
      <div className="flex gap-2">
        <Link href={`/admin/products/${productId}`}>
          <button type="button" className="text-green hover:text-terra">
            <Pencil size={16} />
          </button>
        </Link>
        <button type="button" className="text-terra hover:text-terra-2" onClick={onDelete}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
