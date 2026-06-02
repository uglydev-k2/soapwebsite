"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import type { ReactNode } from "react";

interface ValuesCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export function ValuesCard({ title, description, icon }: ValuesCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      className={cn(
        "group relative h-full overflow-hidden border border-green/10 bg-white p-8",
        "transition-shadow duration-300 hover:shadow-lg"
      )}
      style={{ borderRadius: "2px" }}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-green",
          "transition-transform duration-300 group-hover:scale-x-100"
        )}
      />
      <motion.div
        className="text-green transition-colors duration-250 group-hover:text-terra"
        whileHover={reduced ? undefined : { scale: 1.1, rotate: 4 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
      >
        {icon}
      </motion.div>
      <h3 className="mt-6 font-serif text-xl text-green">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
    </motion.article>
  );
}
