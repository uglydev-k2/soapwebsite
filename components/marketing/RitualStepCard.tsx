"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

interface RitualStepCardProps {
  number: string;
  title: string;
  description: string;
}

export function RitualStepCard({
  number,
  title,
  description,
}: RitualStepCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      className={cn(
        "lavender-card-accent group p-8",
        "transition-all duration-300 hover:border-lavender/30 hover:bg-lavender-light/40"
      )}
      style={{ borderRadius: "2px" }}
      whileHover={reduced ? undefined : { x: 6 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
    >
      <motion.span
        className="label-caps text-lavender-3"
        whileHover={reduced ? undefined : { scale: 1.08 }}
        transition={{ duration: 0.25 }}
      >
        {number}
      </motion.span>
      <h3 className="mt-3 font-serif text-2xl text-green transition-colors duration-250 group-hover:text-lavender-3">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-text/85">{description}</p>
    </motion.article>
  );
}
