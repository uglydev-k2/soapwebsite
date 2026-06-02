"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AnimatedSectionHeader,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/ScrollReveal";
import { EASE_OUT } from "@/lib/motion";

const fragrances = [
  {
    name: "Forest Cedar",
    slug: "forest-cedar",
    description:
      "Grounding notes of cedarwood, fir needle, and moss. Like a walk through an ancient forest.",
    notes: ["Cedarwood", "Fir Needle", "Oakmoss"],
    swatches: ["#2c4a3e", "#3d6454", "#6b5e52"],
  },
  {
    name: "Citrus Bloom",
    slug: "citrus-bloom",
    description:
      "Bright bergamot, neroli, and grapefruit zest. Uplifting and energizing for morning rituals.",
    notes: ["Bergamot", "Neroli", "Grapefruit"],
    swatches: ["#f5d76e", "#e8a838", "#c9a96e"],
  },
  {
    name: "Warm Amber",
    slug: "warm-amber",
    description:
      "Rich amber resin, vanilla orchid, and sandalwood. Wraps you in warmth and comfort.",
    notes: ["Amber", "Vanilla", "Sandalwood"],
    swatches: ["#b5552a", "#c9a96e", "#8c3f1e"],
  },
  {
    name: "Lavender Mist",
    slug: "lavender-mist",
    description:
      "Soft lavender, chamomile, and white tea. Calming and serene for evening unwind.",
    notes: ["Lavender", "Chamomile", "White Tea"],
    swatches: ["#9b8ab8", "#c4b5d4", "#efe9df"],
  },
];

function ScentCard({
  fragrance,
}: {
  fragrance: (typeof fragrances)[number];
}) {
  const reduced = useReducedMotion();
  const tint = `${fragrance.swatches[0]}14`;

  return (
    <motion.div whileHover={reduced ? undefined : { scale: 1.02 }} transition={{ duration: 0.35, ease: EASE_OUT }}>
      <Link
        href={`/shop?scent=${fragrance.slug}`}
        className={cn(
          "group relative block overflow-hidden border border-green/10 bg-white p-8",
          "transition-colors duration-300 hover:border-green/30 hover:shadow-lg"
        )}
        style={{ borderRadius: "2px" }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundColor: tint }}
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1">
              {fragrance.swatches.map((color, i) => (
                <span
                  key={color}
                  className="inline-block h-5 w-5 border border-white shadow-sm"
                  style={{
                    backgroundColor: color,
                    borderRadius: "2px",
                    zIndex: fragrance.swatches.length - i,
                  }}
                  aria-hidden
                />
              ))}
            </div>
            <h3 className="font-serif text-2xl text-green transition-colors duration-250 group-hover:text-terra">
              {fragrance.name}
            </h3>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            {fragrance.description}
          </p>

          <motion.ul
            className="mt-4 flex max-h-0 flex-wrap gap-2 overflow-hidden opacity-0 group-hover:mt-6 group-hover:max-h-24 group-hover:opacity-100"
            initial={false}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            {fragrance.notes.map((note) => (
              <li
                key={note}
                className="label-caps border border-green/15 px-3 py-1 text-xs text-green"
                style={{ borderRadius: "2px" }}
              >
                {note}
              </li>
            ))}
          </motion.ul>

          <span className="mt-6 inline-block label-caps text-green transition-colors duration-250 group-hover:text-terra">
            Explore →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function FragranceMap() {
  return (
    <section className="bg-cream-2 py-20 lg:py-28" id="scents">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSectionHeader
          eyebrow="Scent Profiles"
          title="Find Your Signature Scent"
          description="Each fragrance family is crafted to evoke a mood, a memory, a moment of pure botanical bliss."
        />

        <StaggerContainer className="mt-16 grid grid-cols-2 gap-6">
          {fragrances.map((fragrance) => (
            <StaggerItem key={fragrance.slug}>
              <ScentCard fragrance={fragrance} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
