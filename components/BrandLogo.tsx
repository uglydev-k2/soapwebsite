import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_LOGO_ALT } from "@/lib/brand";

type BrandLogoProps = {
  className?: string;
  /** Smaller text for nav / compact headers */
  size?: "sm" | "md" | "lg";
  /** Kept for API compatibility — logo is the same on all backgrounds */
  variant?: "default" | "light" | "dark";
};

const sizePx = {
  sm: 44,
  md: 56,
  lg: 120,
} as const;

export function BrandLogo({
  className,
  size = "sm",
}: BrandLogoProps) {
  const px = sizePx[size];

  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/images/mv-luscious-lather-logo.jpg"
        alt={BRAND_LOGO_ALT}
        width={px}
        height={px}
        className="h-auto w-auto"
        style={{ width: px, height: px }}
        priority={size === "lg"}
      />
    </span>
  );
}
