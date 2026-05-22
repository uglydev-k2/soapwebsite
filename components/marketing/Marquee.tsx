"use client";

import { cn } from "@/lib/utils";

const items = [
  "Paraben-Free",
  "Sulfate-Free",
  "Cruelty-Free",
  "Handcrafted",
  "Botanical Infused",
  "Small Batch",
  "Eco-Conscious",
  "Phthalate-Free",
];

function MarqueeTrack({ ariaHidden = false }: { ariaHidden?: boolean }) {
  const doubled = [...items, ...items];

  return (
    <div
      className={cn(
        "flex shrink-0 animate-marquee items-center gap-8 pr-8",
        "group-hover:[animation-play-state:paused]"
      )}
      aria-hidden={ariaHidden}
    >
      {doubled.map((item, i) => (
        <span
          key={`${ariaHidden ? "dup" : "orig"}-${item}-${i}`}
          className="flex shrink-0 items-center gap-8 whitespace-nowrap"
        >
          <span className="label-caps text-cream/90">{item}</span>
          <span
            className="h-1.5 w-1.5 bg-gold"
            style={{ borderRadius: "2px" }}
            aria-hidden
          />
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <section
      className="group overflow-hidden bg-green-3 py-4"
      aria-label="Brand values"
    >
      <div className="flex">
        <MarqueeTrack />
        <MarqueeTrack ariaHidden />
      </div>
    </section>
  );
}
