"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@prisma/client";

const CARE_BY_CATEGORY: Partial<Record<Category, { title: string; tips: string[] }>> = {
  BAR_SOAP: {
    title: "Bar soap care",
    tips: [
      "Keep on a draining dish so the bar stays dry between uses.",
      "Store away from direct shower spray to extend life 3–4 weeks.",
      "Lather in hands or on a washcloth — a little goes a long way.",
    ],
  },
  BATH_BODY: {
    title: "Bath & body tips",
    tips: [
      "Use a small amount on a sponge or palms; add water to build lather.",
      "Follow with lotion while skin is still slightly damp.",
      "Pair with the same scent family for a layered fragrance ritual.",
    ],
  },
  CANDLES: {
    title: "Candle care",
    tips: [
      "Trim the wick to ¼ inch before each burn for an even flame.",
      "Allow the first burn to melt the full surface to prevent tunneling.",
      "Never leave a lit candle unattended.",
    ],
  },
  ACCESSORIES: {
    title: "Accessory care",
    tips: [
      "Rinse soap dishes and bags regularly to keep products fresh.",
      "Store accessories in a dry place between uses.",
    ],
  },
  GIFT_SET: {
    title: "Gift set notes",
    tips: [
      "Store in a cool, dry place until gifting.",
      "Include a note about the scent story for a personal touch.",
      "Recipient can follow cleanse → treat → scent order for full ritual.",
    ],
  },
};

export function ProductCareAccordion({ category }: { category: Category }) {
  const care = CARE_BY_CATEGORY[category];
  const [open, setOpen] = useState(false);
  if (!care) return null;

  return (
    <div className="mt-8 border border-green/10 bg-white" style={{ borderRadius: "2px" }}>
      <button
        type="button"
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="subheading text-lg">{care.title}</span>
        <ChevronDown
          size={18}
          className={cn("text-muted transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul className="space-y-2 border-t border-green/10 px-6 py-4 text-sm text-muted">
          {care.tips.map((tip) => (
            <li key={tip}>· {tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
