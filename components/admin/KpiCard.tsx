import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "warning";
  progress?: number;
  className?: string;
}

export function KpiCard({
  label,
  value,
  change,
  changeType = "positive",
  progress = 0,
  className,
}: KpiCardProps) {
  const changeColors = {
    positive: "bg-green/10 text-green",
    negative: "bg-red-100 text-red-700",
    neutral: "bg-gray-100 text-gray-600",
    warning: "bg-amber-100 text-amber-800",
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("admin-card flex flex-col", className)}>
      <p className="label-caps mb-3 text-muted">{label}</p>
      <p className="font-serif text-4xl font-semibold text-green">{value}</p>
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
      <div className="mt-4 h-1 w-full overflow-hidden bg-cream-2">
        <div
          className="h-full bg-terra transition-all duration-500"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
