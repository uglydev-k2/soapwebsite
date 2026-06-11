"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { CustomerPanel } from "@/components/admin/CustomerPanel";
import { formatDate, formatPrice } from "@/lib/utils";
import { Download, Trash2, Ban, ShieldCheck } from "lucide-react";
import type { CustomerRow } from "@/components/admin/CustomersTable";

interface CustomersPageClientProps {
  customers: CustomerRow[];
}

export default function CustomersPageClient({
  customers: initialCustomers,
}: CustomersPageClientProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<CustomerRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/customers?${params}`);
      const json = await res.json();
      if (res.ok) setCustomers(json.data ?? []);
    } catch {
      addToast("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, addToast]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(() => {
    if (!search && !statusFilter) return customers;
    return customers;
  }, [customers, search, statusFilter]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelected(
      selected.length === filtered.length ? [] : filtered.map((c) => c.id)
    );
  };

  const updateStatus = async (id: string, status: "ACTIVE" | "BANNED") => {
    const res = await fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      addToast("Failed to update customer", "error");
      return;
    }
    addToast(status === "BANNED" ? "Customer banned" : "Customer unbanned");
    load();
  };

  const bulkDelete = async () => {
    const res = await fetch("/api/customers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected }),
    });
    if (!res.ok) {
      addToast("Failed to delete customers", "error");
      return;
    }
    addToast(`${selected.length} customers deleted`);
    setSelected([]);
    setConfirmDelete(false);
    load();
  };

  const exportCsv = () => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (statusFilter) query.set("status", statusFilter);
    window.open(`/api/admin/export/customers?${query.toString()}`, "_blank");
    addToast("Exporting customers CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
        <Input
          label="Search"
          placeholder="Name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:min-w-[200px] sm:flex-1"
        />
        <div className="w-full sm:w-auto">
          <label className="label-caps mb-2 block text-muted">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input w-full sm:min-w-[140px]"
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        {selected.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="sm" onClick={exportCsv} className="w-full sm:w-auto">
              <Download size={14} className="mr-1" />
              Export ({selected.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 size={14} className="mr-1" />
              Delete ({selected.length})
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="admin-card animate-pulse py-16 text-center text-muted">
          Loading customers…
        </div>
      ) : (
        <DataTable
          data={filtered}
          keyExtractor={(c) => c.id}
          selectable
          selectedIds={selected}
          onSelect={toggleSelect}
          onSelectAll={toggleAll}
          onRowClick={(c) => setDetail(c)}
          emptyMessage="No customers found"
          columns={[
            {
              key: "name",
              header: "Customer",
              mobilePrimary: true,
              render: (c) => (
                <span className="font-medium text-green">
                  {c.firstName} {c.lastName}
                </span>
              ),
            },
            { key: "email", header: "Email" },
            {
              key: "status",
              header: "Status",
              render: (c) => (
                <Badge
                  variant="status"
                  status={
                    c.status === "BANNED"
                      ? "CANCELLED"
                      : c.status === "INACTIVE"
                        ? "PENDING"
                        : "DELIVERED"
                  }
                >
                  {c.status ?? "ACTIVE"}
                </Badge>
              ),
            },
            { key: "ordersCount", header: "Orders" },
            {
              key: "totalSpent",
              header: "Spent",
              render: (c) => formatPrice(c.totalSpent),
            },
            {
              key: "createdAt",
              header: "Joined",
              render: (c) => formatDate(c.createdAt),
            },
            {
              key: "lastActiveAt",
              header: "Last Active",
              render: (c) =>
                c.lastActiveAt ? formatDate(c.lastActiveAt) : "—",
            },
            {
              key: "actions",
              header: "Actions",
              render: (c) => (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {c.status === "BANNED" ? (
                    <button
                      type="button"
                      onClick={() => updateStatus(c.id, "ACTIVE")}
                      className="text-xs text-green hover:underline"
                      title="Unban"
                    >
                      <ShieldCheck size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateStatus(c.id, "BANNED")}
                      className="text-xs text-terra hover:underline"
                      title="Ban"
                    >
                      <Ban size={14} />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}

      <CustomerPanel
        customer={detail}
        open={!!detail}
        onClose={() => setDetail(null)}
      />

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete customers?"
      >
        <p className="mb-4 text-sm text-muted">
          Permanently delete {selected.length} customer
          {selected.length !== 1 ? "s" : ""}? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={bulkDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
