"use client";

import { useEffect, useState } from "react";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTable } from "@/components/ui/DataTable";
import { Badge, CategoryBadge } from "@/components/ui/Badge";
import { formatPrice, getCategoryLabel } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  moderationStatus: string;
  active: boolean;
  updatedAt: string;
}

export default function ContentPageClient() {
  const addToast = useToastStore((s) => s.addToast);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (filter) params.set("search", filter);
    fetch(`/api/admin/content?${params}`)
      .then((r) => r.json())
      .then((res) => setProducts(res.data?.products ?? []));
  };

  useEffect(load, [statusFilter, filter]);

  const moderate = async (moderationStatus: string, active?: boolean) => {
    if (!selected.length) {
      addToast("Select products first", "error");
      return;
    }
    await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, moderationStatus, active }),
    });
    addToast(`${selected.length} products updated`);
    setSelected([]);
    load();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search content..." variant="admin" className="max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
        <select className="admin-input max-w-[160px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="FLAGGED">Flagged</option>
          <option value="REJECTED">Rejected</option>
        </select>
        {selected.length > 0 && (
          <>
            <Button size="sm" variant="ghost" onClick={() => moderate("APPROVED", true)}>Approve</Button>
            <Button size="sm" variant="ghost" onClick={() => moderate("REJECTED", false)}>Reject</Button>
            <Button size="sm" variant="danger" onClick={() => moderate("FLAGGED")}>Flag</Button>
          </>
        )}
      </div>

      <DataTable
        data={products}
        keyExtractor={(p) => p.id}
        selectable
        selectedIds={selected}
        onSelect={(id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
        onSelectAll={() => setSelected(selected.length === products.length ? [] : products.map((p) => p.id))}
        columns={[
          { key: "name", header: "Product", render: (p) => <span className="font-serif text-green">{p.name}</span> },
          { key: "category", header: "Type", render: (p) => <CategoryBadge category={getCategoryLabel(p.category)} /> },
          { key: "price", header: "Price", render: (p) => formatPrice(p.price) },
          { key: "status", header: "Moderation", render: (p) => <Badge status={p.moderationStatus} /> },
          { key: "active", header: "Live", render: (p) => <span className={p.active ? "text-green" : "text-muted"}>{p.active ? "Yes" : "No"}</span> },
        ]}
      />
    </div>
  );
}
