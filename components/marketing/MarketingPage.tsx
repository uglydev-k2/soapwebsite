import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MarketingPageProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  wide?: boolean;
}

export function MarketingPage({
  eyebrow,
  title,
  description,
  children,
  className,
  wide = false,
}: MarketingPageProps) {
  return (
    <section className="marketing-header-offset min-h-screen bg-cream px-4 pb-24 sm:px-6">
      <div
        className={cn(
          "mx-auto",
          wide ? "max-w-6xl" : "max-w-3xl",
          className
        )}
      >
        <p className="label-caps text-terra">{eyebrow}</p>
        <h1 className="mt-4 font-serif text-3xl font-semibold tracking-wide text-green sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 text-text leading-relaxed">{description}</p>
        )}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
