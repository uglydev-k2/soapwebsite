"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "marketing" | "admin";
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "admin", label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="label-caps text-muted block mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            variant === "marketing" ? "input-marketing" : "input-admin",
            error && "border-terra",
            className
          )}
          {...props}
        />
        {error && <p className="text-terra text-xs mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
