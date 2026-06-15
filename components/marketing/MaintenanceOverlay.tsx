"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "msvee-maintenance-dismissed";

export function useMaintenanceDismissed() {
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, []);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }, []);

  return { dismissed, dismiss, ready };
}

export function MaintenanceOverlay({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="maintenance-title"
      aria-describedby="maintenance-message"
    >
      <div
        className="absolute inset-0 bg-green-3/95 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-2xl border-2 border-gold/40 bg-cream px-6 py-10 text-center shadow-2xl sm:px-12 sm:py-14"
        style={{ borderRadius: "2px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="admin-touch-target absolute right-3 top-3 text-muted transition-colors hover:text-green sm:right-4 sm:top-4"
          aria-label="Close"
        >
          <X size={24} strokeWidth={1.5} />
        </button>
        <p className="label-caps text-terra">MsVee Soaps</p>
        <h1
          id="maintenance-title"
          className="mt-4 font-serif text-4xl leading-tight text-green sm:text-5xl lg:text-6xl"
        >
          We&apos;ll Be Back Soon
        </h1>
        <p
          id="maintenance-message"
          className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
        >
          {message}
        </p>
        <p className="mt-8 label-caps text-sm text-green/70">
          Site under maintenance · Shopping temporarily unavailable
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="mailto:hello@msvee.co"
            className="inline-flex min-h-[3rem] items-center justify-center bg-terra px-10 py-3.5 text-sm label-caps text-white transition-colors hover:bg-terra-2"
            style={{ borderRadius: 0 }}
          >
            Email Us
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[3rem] items-center justify-center border border-green/25 bg-white px-10 py-3.5 text-sm label-caps text-green transition-colors hover:border-terra/40 hover:text-terra"
            style={{ borderRadius: 0 }}
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
