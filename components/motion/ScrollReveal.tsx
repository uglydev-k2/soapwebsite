"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  EASE_OUT,
  fadeUp,
  fadeUpScale,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion";
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
  variant = "scale",
}: {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "scale";
}) {
  const reduced = useReducedMotion();
  const itemVariants = variant === "fade" ? fadeUp : fadeUpScale;

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={itemVariants}>
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
  accent?: "terra" | "lavender";
  headingLevel?: "h1" | "h2";
  className?: string;
}

export function AnimatedSectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  theme = "light",
  accent = "terra",
  headingLevel = "h2",
  className,
}: SectionHeaderProps) {
  const reduced = useReducedMotion();
  const Heading = headingLevel;
  const centered = align === "center";
  const isDark = theme === "dark";
  const eyebrowClass =
    accent === "lavender"
      ? isDark
        ? "text-lavender-2"
        : "text-lavender-3"
      : isDark
        ? "text-gold"
        : "text-terra";
  const dividerClass =
    accent === "lavender"
      ? isDark
        ? "bg-lavender-2/60"
        : "bg-lavender/45"
      : isDark
        ? "bg-gold/50"
        : "bg-terra/50";

  if (reduced) {
    return (
      <div className={cn(centered && "mx-auto max-w-2xl text-center", className)}>
        <span className={cn("label-caps", eyebrowClass)}>
          {eyebrow}
        </span>
        <Heading
          className={cn(
            "mt-4 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl",
            isDark ? "text-cream" : "text-green"
          )}
        >
          {title}
        </Heading>
        {description && (
          <p className={cn("mt-4 text-sm sm:text-base", isDark ? "text-cream" : "text-text/90")}>
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
        className={cn("label-caps block", eyebrowClass)}
        variants={fadeUp}
      >
        {eyebrow}
      </motion.span>
      <motion.div variants={fadeUp}>
        <Heading
          className={cn(
            "mt-4 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl",
            isDark ? "text-cream" : "text-green"
          )}
        >
          {title}
        </Heading>
      </motion.div>
      <motion.div
        className={cn(
          "mt-4 h-px",
          dividerClass,
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
          className={cn(
            "mt-4 text-sm sm:text-base",
            isDark ? "text-cream" : "text-text/90"
          )}
          variants={fadeUp}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
