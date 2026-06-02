"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToastStore } from "@/store/toastStore";
import type { WishlistItem } from "@/store/wishlistStore";

interface WishlistButtonProps {
  item: WishlistItem;
  className?: string;
}

export function WishlistButton({ item, className }: WishlistButtonProps) {
  const toggle = useWishlistStore((s) => s.toggle);
  const saved = useWishlistStore((s) => s.has(item.productId));
  const addToast = useToastStore((s) => s.addToast);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
        addToast(
          saved ? "Removed from wishlist" : "Saved to wishlist",
          "success"
        );
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center border transition-colors duration-250",
        saved
          ? "border-terra bg-terra text-white"
          : "border-green/20 bg-white/90 text-green hover:border-terra hover:text-terra",
        className
      )}
      style={{ borderRadius: "2px" }}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
    >
      <Heart size={16} fill={saved ? "currentColor" : "none"} strokeWidth={1.5} />
    </button>
  );
}
