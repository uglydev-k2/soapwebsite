"use client";

import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const typeStyles = {
  success: "bg-green text-white",
  error: "bg-terra text-white",
  info: "bg-gold text-green-3",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 min-w-[240px] shadow-lg label-caps",
            typeStyles[toast.type]
          )}
          style={{ borderRadius: 0 }}
        >
          <span className="flex-1 normal-case font-sans text-sm tracking-normal">
            {toast.message}
          </span>
          <button onClick={() => removeToast(toast.id)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
