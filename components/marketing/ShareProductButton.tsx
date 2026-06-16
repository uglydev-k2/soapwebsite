"use client";

import { Share2 } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export function ShareProductButton({ name }: { name: string }) {
  const addToast = useToastStore((s) => s.addToast);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text: `Check out ${name} from mvlusciouslather`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      addToast("Link copied to clipboard");
    } catch {
      addToast("Could not share right now", "error");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 border border-green/20 px-4 py-2 text-xs label-caps text-green transition-colors hover:border-terra hover:text-terra"
      style={{ borderRadius: "2px" }}
    >
      <Share2 size={14} />
      Share
    </button>
  );
}
