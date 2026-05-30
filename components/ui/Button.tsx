"use client";

import { cn } from "@/lib/utils";
import {
  ButtonHTMLAttributes,
  forwardRef,
  useCallback,
  useState,
  type MouseEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

type Ripple = { id: number; x: number; y: number };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, onClick, ...props },
    ref
  ) => {
    const reduced = useReducedMotion();
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const variants = {
      primary:
        "bg-terra text-white hover:bg-terra-2 border border-terra transition-colors duration-250",
      ghost:
        "bg-transparent text-green border border-green/30 hover:border-green hover:bg-green/5 transition-colors duration-250",
      outline:
        "bg-transparent text-text border border-green/20 hover:border-green transition-colors duration-250",
      danger:
        "bg-terra text-white hover:bg-terra-2 border border-terra transition-colors duration-250",
    };
    const sizes = {
      sm: "px-4 py-2 text-xs label-caps",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-sm label-caps",
    };

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        if (!reduced && !props.disabled) {
          const rect = event.currentTarget.getBoundingClientRect();
          const id = Date.now();
          setRipples((prev) => [
            ...prev,
            { id, x: event.clientX - rect.left, y: event.clientY - rect.top },
          ]);
          window.setTimeout(
            () => setRipples((prev) => prev.filter((r) => r.id !== id)),
            550
          );
        }
        onClick?.(event);
      },
      [onClick, props.disabled, reduced]
    );

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden font-sans font-normal disabled:cursor-not-allowed disabled:opacity-50",
          variant === "primary" && "cta-shimmer",
          variants[variant],
          sizes[size],
          className
        )}
        style={{ borderRadius: 0 }}
        onClick={handleClick}
        {...props}
      >
        {!reduced &&
          ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="pointer-events-none absolute rounded-full bg-white/35"
              style={{ left: ripple.x, top: ripple.y }}
              initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.6 }}
              animate={{ width: 220, height: 220, x: -110, y: -110, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        <span className="relative z-[1]">{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";
