"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";
import type { ApiResponse } from "@/types";

type PushConfig = {
  configured: boolean;
  publicKey: string | null;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationToggle({ className }: { className?: string }) {
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);

  const checkExisting = useCallback(async () => {
    if (!("Notification" in window)) {
      setSupported(false);
      setLoading(false);
      return;
    }

    setSupported(true);

    try {
      const res = await fetch("/api/admin/push/subscribe");
      const json = (await res.json()) as ApiResponse<PushConfig>;
      if (res.ok && json.data) {
        setConfigured(json.data.configured);
        setPublicKey(json.data.publicKey);
      }

      if ("serviceWorker" in navigator && "PushManager" in window) {
        const registration = await navigator.serviceWorker.getRegistration("/admin-sw.js");
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            setEnabled(true);
            return;
          }
        }
      }

      setEnabled(Notification.permission === "granted");
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkExisting();
  }, [checkExisting]);

  const enablePush = async () => {
    setEnabling(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        addToast("Notification permission denied", "error");
        return;
      }

      if (publicKey && configured) {
        const registration = await navigator.serviceWorker.register("/admin-sw.js", {
          scope: "/",
        });
        await navigator.serviceWorker.ready;

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }

        const json = subscription.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          addToast("Failed to create push subscription", "error");
          return;
        }

        const res = await fetch("/api/admin/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: {
              p256dh: json.keys.p256dh,
              auth: json.keys.auth,
            },
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          addToast(err.error ?? "Failed to save subscription", "error");
          return;
        }
      }

      setEnabled(true);
      addToast(
        publicKey && configured
          ? "Browser notifications enabled"
          : "Desktop alerts enabled for this session"
      );
    } catch {
      addToast("Could not enable push notifications", "error");
    } finally {
      setEnabling(false);
    }
  };

  const disablePush = async () => {
    setEnabling(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/admin-sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/admin/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setEnabled(false);
      addToast("Browser notifications disabled", "info");
    } catch {
      addToast("Failed to disable notifications", "error");
    } finally {
      setEnabling(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("admin-card flex items-center gap-3 p-5 text-sm text-muted", className)}>
        <Loader2 size={16} className="animate-spin" />
        Checking notification support…
      </div>
    );
  }

  if (!supported) {
    return (
      <div className={cn("admin-card p-5", className)}>
        <p className="label-caps text-muted">Browser Notifications</p>
        <p className="mt-2 text-sm text-muted">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("admin-card p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-caps text-muted">Browser Notifications</p>
          <p className="mt-2 text-sm text-muted">
            Get instant alerts for new orders even when the admin tab is in the
            background.
          </p>
          {!configured && (
            <p className="mt-2 text-xs text-terra">
              Server push requires VAPID keys in your environment. Foreground
              alerts still work via live polling.
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant={enabled ? "ghost" : "primary"}
          onClick={enabled ? disablePush : enablePush}
          disabled={enabling}
          className="gap-2"
        >
          {enabling ? (
            <Loader2 size={14} className="animate-spin" />
          ) : enabled ? (
            <BellOff size={14} />
          ) : (
            <Bell size={14} />
          )}
          {enabled ? "Disable push" : "Enable push"}
        </Button>
      </div>
      {enabled && (
        <p className="mt-3 text-xs text-green">
          Push enabled for this browser · live polling toasts remain active
        </p>
      )}
    </div>
  );
}

/** Show a native notification when the tab is open and permission is granted */
export function showForegroundNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState !== "hidden") return;
  new Notification(title, {
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    ...options,
  });
}
