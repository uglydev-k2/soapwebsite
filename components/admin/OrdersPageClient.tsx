"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import type { Order, Customer, OrderItem } from "@prisma/client";

type OrderWithRelations = Order & {
  customer: Pick<Customer, "firstName" | "lastName" | "email">;
  items: OrderItem[];
};

const tabs = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersPageClient({
  orders,
  initialStatus,
}: {
  orders: OrderWithRelations[];
  initialStatus: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const addToast = useToastStore((s) => s.addToast);
  const [selected, setSelected] = useState<string[]>([]);

  const setStatus = (status: string) => {
    const p = new URLSearchParams(params.toString());
    if (status === "ALL") p.delete("status");
    else p.set("status", status);
    router.push(`/admin/orders?${p.toString()}`);
  };

  const bulkUpdate = async (status: string) => {
    await Promise.all(
      selected.map((id) =>
        fetch(`/api/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        })
      )
    );
    addToast(`${selected.length} orders updated to ${status}`);
    setSelected([]);
    router.refresh();
  };

  const exportCsv = () => {
    const query = new URLSearchParams(params.toString());
    window.open(`/api/admin/export/orders?${query.toString()}`, "_blank");
    addToast("Exporting orders CSV");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-green/10 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatus(tab)}
            className={cn(
              "label-caps px-3 py-2 transition-colors",
              initialStatus === tab
                ? "text-terra border-b-2 border-terra"
                : "text-muted hover:text-green"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search order # or email..."
          variant="admin"
          className="max-w-sm"
          defaultValue={params.get("search") || ""}
          onChange={(e) => {
            const p = new URLSearchParams(params.toString());
            if (e.target.value) p.set("search", e.target.value);
            else p.delete("search");
            router.push(`/admin/orders?${p.toString()}`);
          }}
        />
        <Button size="sm" variant="ghost" onClick={exportCsv} className="gap-2">
          <Download size={14} />
          Export CSV
        </Button>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => bulkUpdate("PROCESSING")}>
              Mark Processing
            </Button>
            <Button size="sm" variant="ghost" onClick={() => bulkUpdate("SHIPPED")}>
              Mark Shipped
            </Button>
            <Button size="sm" variant="ghost" onClick={() => bulkUpdate("DELIVERED")}>
              Mark Delivered
            </Button>
            <Button size="sm" variant="danger" onClick={() => bulkUpdate("CANCELLED")}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <OrdersTable
        orders={orders}
        selectable
        selectedIds={selected}
        onSelect={(id) =>
          setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
          )
        }
        onSelectAll={() =>
          setSelected(selected.length === orders.length ? [] : orders.map((o) => o.id))
        }
      />
    </div>
  );
}
