"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT, HOVER_LIFT } from "@/lib/motion";
import type { ReactNode } from "react";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
}

export function InteractiveCard({ children, className }: InteractiveCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn("h-full", className)}
      whileHover={reduced ? undefined : HOVER_LIFT}
      whileTap={reduced ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

interface InteractiveMediaProps {
  children: ReactNode;
  className?: string;
}

export function InteractiveMedia({ children, className }: InteractiveMediaProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      whileHover={reduced ? undefined : { scale: 1.06 }}
      transition={{ duration: 0.55, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
