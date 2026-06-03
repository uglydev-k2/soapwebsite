import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/admin/Sparkline";

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "warning";
  sparkline?: number[];
  href?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  change,
  changeType = "positive",
  sparkline,
  href,
  className,
}: KpiCardProps) {
  const changeColors = {
    positive: "bg-green/10 text-green",
    negative: "bg-red-100 text-red-700",
    neutral: "bg-gray-100 text-gray-600",
    warning: "bg-amber-100 text-amber-800",
  };

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="label-caps text-muted">{label}</p>
        {sparkline && sparkline.length > 1 && (
          <Sparkline data={sparkline} className="opacity-80" />
        )}
      </div>
      <p className="mt-3 font-serif text-4xl font-semibold text-green">{value}</p>
      {change && (
        <span
          className={cn(
            "mt-2 inline-flex w-fit items-center px-2 py-0.5 text-xs",
            changeColors[changeType]
          )}
        >
          {change}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          "admin-card admin-card-interactive flex flex-col transition-shadow hover:shadow-md",
          className
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={cn("admin-card flex flex-col", className)}>{content}</div>
  );
}
