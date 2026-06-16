import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_LOGO_ALT } from "@/lib/brand";

type BrandLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light" | "dark";
};

const config = {
  sm: { icon: 40, text: "text-lg sm:text-xl", gap: "gap-2.5" },
  md: { icon: 52, text: "text-xl sm:text-2xl", gap: "gap-3" },
  lg: { icon: 96, text: "text-4xl sm:text-5xl", gap: "gap-4" },
} as const;

export function BrandLogo({
  className,
  size = "sm",
  variant = "default",
}: BrandLogoProps) {
  const { icon, text, gap } = config[size];
  const mainColor =
    variant === "light"
      ? "text-cream"
      : variant === "dark"
        ? "text-green-2"
        : "text-green";

  return (
    <span className={cn("inline-flex shrink-0 items-center", gap, className)}>
      <Image
        src="/images/mv-luscious-lather-logo.jpg"
        alt={BRAND_LOGO_ALT}
        width={icon}
        height={icon}
        className="shrink-0 rounded-full"
        style={{ width: icon, height: icon }}
        priority={size === "lg"}
      />
      <span
        className={cn(
          "inline-flex items-baseline font-serif uppercase leading-none tracking-wide",
          text
        )}
      >
        <span className="italic text-terra normal-case">MV</span>
        <span className={cn("ml-1", mainColor)}>LUSCIOUS LATHER</span>
      </span>
    </span>
  );
}
