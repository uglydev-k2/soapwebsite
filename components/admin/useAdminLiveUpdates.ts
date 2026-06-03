"use client";

import { useEffect, useRef } from "react";
import { useToastStore } from "@/store/toastStore";
import { showForegroundNotification } from "@/components/admin/PushNotificationToggle";
import type { ApiResponse } from "@/types";

type LiveData = {
  pendingOrders: number;
  newOrdersSince: number;
  lowStockCount: number;
  latestOrder?: {
    id?: string;
    orderNumber: string;
    createdAt: string;
  } | null;
  serverTime: string;
};

const POLL_MS = 20_000;

export function useAdminLiveUpdates(enabled = true) {
  const addToast = useToastStore((s) => s.addToast);
  const sinceRef = useRef<string>(new Date().toISOString());
  const pendingRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const params = new URLSearchParams({ since: sinceRef.current });
        const res = await fetch(`/api/admin/live?${params.toString()}`);
        const json = (await res.json()) as ApiResponse<LiveData>;
        if (!res.ok || !json.data || cancelled) return;

        const { pendingOrders, newOrdersSince, latestOrder, serverTime } =
          json.data;

        if (initializedRef.current) {
          if (newOrdersSince > 0) {
            const message = `${newOrdersSince} new order${newOrdersSince > 1 ? "s" : ""} received`;
            addToast(message, "info");
            showForegroundNotification("New order received", {
              body: latestOrder
                ? `${latestOrder.orderNumber}${latestOrder.id ? "" : ""}`
                : message,
              tag: latestOrder?.orderNumber ?? "new-order",
            });
          } else if (
            pendingRef.current !== null &&
            pendingOrders > pendingRef.current
          ) {
            addToast(
              `${pendingOrders - pendingRef.current} order${pendingOrders - pendingRef.current > 1 ? "s" : ""} moved to pending`,
              "info"
            );
          } else if (latestOrder && newOrdersSince > 0) {
            addToast(`New order ${latestOrder.orderNumber}`, "info");
          }
        } else {
          initializedRef.current = true;
        }

        pendingRef.current = pendingOrders;
        sinceRef.current = serverTime;

        window.dispatchEvent(
          new CustomEvent("admin-live-update", { detail: json.data })
        );
      } catch {
        /* ignore transient network errors */
      }
    };

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled, addToast]);
}
