"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDateTime } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  body: string;
  segment: string;
  sentCount: number;
  sentAt: string | null;
  createdBy: string;
  createdAt: string;
}

export default function NotificationsPageClient() {
  const addToast = useToastStore((s) => s.addToast);
  const [history, setHistory] = useState<Announcement[]>([]);
  const [sending, setSending] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ title: string; body: string; segment: string }>({
    defaultValues: { segment: "all" },
  });

  const load = () => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((res) => setHistory(res.data ?? []));
  };

  useEffect(load, []);

  const onSubmit = async (data: { title: string; body: string; segment: string }) => {
    setSending(true);
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setSending(false);
    if (res.ok) {
      addToast(`Sent to ${json.data?.sentCount ?? 0} recipients`);
      reset();
      load();
    } else {
      addToast(json.error || "Failed to send", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="admin-card p-6">
        <h2 className="label-caps mb-4 text-muted">Send Announcement</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Subject" variant="admin" {...register("title", { required: true })} />
          <div>
            <label className="label-caps mb-2 block text-muted">Message</label>
            <textarea className="admin-input min-h-[120px]" {...register("body", { required: true })} />
          </div>
          <div>
            <label className="label-caps mb-2 block text-muted">Segment</label>
            <select className="admin-input" {...register("segment")}>
              <option value="all">All Customers</option>
              <option value="newsletter">Newsletter Subscribers</option>
            </select>
          </div>
          <Button type="submit" disabled={sending} className="w-full">
            {sending ? "Sending..." : "Send Broadcast"}
          </Button>
        </form>
      </div>

      <div className="admin-card p-6">
        <h2 className="label-caps mb-4 text-muted">Notification History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted">No announcements sent yet</p>
        ) : (
          <ul className="divide-y divide-green/5">
            {history.map((a) => (
              <li key={a.id} className="py-3">
                <p className="font-serif text-green">{a.title}</p>
                <p className="text-xs text-muted">
                  {a.sentCount} sent · {a.segment} · {formatDateTime(a.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
