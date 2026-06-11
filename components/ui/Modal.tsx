"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-green-3/60"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal
        aria-labelledby="modal-title"
        className={cn(
          "relative w-full max-w-md bg-white p-6 card-border shadow-xl",
          "max-h-[min(90dvh,640px)] overflow-y-auto",
          "rounded-t-lg sm:rounded-none",
          "supports-[padding:max(0px)]:pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="font-serif text-xl text-green">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="admin-touch-target text-muted transition-colors hover:text-green"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
