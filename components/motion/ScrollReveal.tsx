"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT, fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: ScrollRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.5, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: StaggerContainerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={staggerContainer(stagger, delay)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  theme?: "light" | "dark";
  className?: string;
}

export function AnimatedSectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  theme = "light",
  className,
}: SectionHeaderProps) {
  const reduced = useReducedMotion();
  const centered = align === "center";
  const isDark = theme === "dark";

  if (reduced) {
    return (
      <div className={cn(centered && "mx-auto max-w-2xl text-center", className)}>
        <span className={cn("label-caps", isDark ? "text-gold" : "text-terra")}>
          {eyebrow}
        </span>
        <h2
          className={cn(
            "mt-4 font-serif text-4xl font-light lg:text-5xl",
            isDark ? "text-cream" : "text-green"
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn("mt-4", isDark ? "text-cream/70" : "text-muted")}>
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(centered && "mx-auto max-w-2xl text-center", className)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={staggerContainer(0.1, 0)}
    >
      <motion.span
        className={cn("label-caps block", isDark ? "text-gold" : "text-terra")}
        variants={fadeUp}
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        className={cn(
          "mt-4 font-serif text-4xl font-light lg:text-5xl",
          isDark ? "text-cream" : "text-green"
        )}
        variants={fadeUp}
      >
        {title}
      </motion.h2>
      <motion.div
        className={cn(
          "mt-4 h-px",
          isDark ? "bg-gold/50" : "bg-terra/50",
          centered ? "mx-auto w-24" : "w-24"
        )}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT }}
        style={{ originX: 0 }}
      />
      {description && (
        <motion.p
          className={cn("mt-4", isDark ? "text-cream/70" : "text-muted")}
          variants={fadeUp}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
