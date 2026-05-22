"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
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

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-sans font-normal disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        style={{ borderRadius: 0 }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
