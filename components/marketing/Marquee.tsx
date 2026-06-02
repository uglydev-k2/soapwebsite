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
  return (
    <div
      className={cn(
        "flex shrink-0 animate-marquee items-center",
        "group-hover:[animation-play-state:paused]"
      )}
      aria-hidden={ariaHidden}
    >
      {items.map((item) => (
        <span
          key={`${ariaHidden ? "dup" : "orig"}-${item}`}
          className="flex shrink-0 items-center gap-8 px-8"
        >
          <span className="label-caps text-cream/90">{item}</span>
          <span
            className="h-1.5 w-1.5 shrink-0 bg-gold"
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
      className="group relative overflow-hidden bg-green-3 py-4"
      aria-label="Brand values"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-green-3 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-green-3 to-transparent"
        aria-hidden
      />
      <div className="flex w-max">
        <MarqueeTrack />
        <MarqueeTrack ariaHidden />
      </div>
    </section>
  );
}
