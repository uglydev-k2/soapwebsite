import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** Smaller text for nav / compact headers */
  size?: "sm" | "md" | "lg";
  /** Light text on dark backgrounds (footer, splash) */
  variant?: "default" | "light" | "dark";
};

const sizeClasses = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-5xl",
};

export function BrandLogo({
  className,
  size = "sm",
  variant = "default",
}: BrandLogoProps) {
  const mainColor =
    variant === "light"
      ? "text-cream"
      : variant === "dark"
        ? "text-green-2"
        : "text-green";

  return (
    <span
      className={cn(
        "inline-flex items-baseline font-serif uppercase tracking-wide",
        sizeClasses[size],
        className
      )}
    >
      <span className="italic text-terra normal-case">MV</span>
      <span className={cn(mainColor)}>LUSCIOUSLATHER</span>
    </span>
  );
}
