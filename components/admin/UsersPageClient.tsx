"use client";

import { useEffect, useState } from "react";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { roleLabel } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import { Trash2, UserPlus } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

const ROLES = ["SUPER_ADMIN", "ADMIN", "MODERATOR"] as const;

export default function UsersPageClient() {
  const addToast = useToastStore((s) => s.addToast);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", name: "", role: "ADMIN" });

  const load = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((res) => {
        setUsers(res.data ?? []);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const invite = async () => {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      addToast("Admin user created");
      setInviteOpen(false);
      load();
    } else {
      addToast(data.error || "Failed", "error");
    }
  };

  const updateRole = async (id: string, role: string) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    addToast("Role updated", "info");
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    addToast(active ? "User activated" : "User deactivated", "info");
    load();
  };

  const remove = async () => {
    if (!deleteId) return;
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    addToast("Admin deleted");
    setDeleteId(null);
    load();
  };

  if (loading) {
    return <div className="animate-pulse space-y-3">{[1, 2, 3].map((i) => (
      <div key={i} className="h-12 bg-cream-2" />
    ))}</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <p className="text-sm text-muted">{users.length} admin accounts</p>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus size={16} className="mr-2" />
          Invite Admin
        </Button>
      </div>

      <DataTable
        data={users}
        keyExtractor={(u) => u.id}
        columns={[
          { key: "name", header: "Name", render: (u) => u.name },
          { key: "email", header: "Email", render: (u) => u.email },
          {
            key: "role",
            header: "Role",
            render: (u) => (
              <select
                className="admin-input text-xs"
                value={u.role}
                onChange={(e) => updateRole(u.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>
            ),
          },
          {
            key: "active",
            header: "Status",
            render: (u) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleActive(u.id, !u.active);
                }}
                className={`label-caps text-xs ${u.active ? "text-green" : "text-terra"}`}
              >
                {u.active ? "Active" : "Inactive"}
              </button>
            ),
          },
          {
            key: "createdAt",
            header: "Joined",
            render: (u) => formatDate(u.createdAt),
          },
          {
            key: "actions",
            header: "Actions",
            render: (u) => (
              <button
                className="text-terra hover:text-terra-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(u.id);
                }}
              >
                <Trash2 size={16} />
              </button>
            ),
          },
        ]}
      />

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Admin">
        <div className="space-y-4">
          <Input label="Name" variant="admin" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" variant="admin" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div>
            <label className="label-caps mb-2 block text-muted">Role</label>
            <select className="admin-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{roleLabel(r)}</option>
              ))}
            </select>
          </div>
          <Button onClick={invite} className="w-full">Create Admin</Button>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Admin">
        <p className="mb-4 text-sm text-muted">This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={remove}>Delete</Button>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
