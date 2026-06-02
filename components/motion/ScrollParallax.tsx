"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ScrollParallaxProps {
  children: ReactNode;
  className?: string;
  offset?: number;
}

export function ScrollParallax({
  children,
  className,
  offset = 40,
}: ScrollParallaxProps) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, reduced ? 0 : offset]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

interface AmbientOrbsProps {
  className?: string;
}

export function AmbientOrbs({ className }: AmbientOrbsProps) {
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute -left-20 top-1/4 h-64 w-64 animate-orb-drift rounded-full bg-terra/8 blur-3xl" />
      <div
        className="absolute -right-16 bottom-1/4 h-72 w-72 animate-orb-drift rounded-full bg-gold/10 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
    </div>
  );
}
