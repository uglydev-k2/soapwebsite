import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-8", className)}>
      <ol className="flex flex-wrap items-center gap-2 text-xs label-caps text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden className="text-green/25">/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-green">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-green" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
