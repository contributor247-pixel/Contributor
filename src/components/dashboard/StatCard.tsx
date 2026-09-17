import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  alert?: boolean;
  trend?: string;
  description?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  alert = false,
  trend,
  description,
}: StatCardProps) {
  return (
    <div
      className={[
        "group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 bg-surface shadow-xs hover:-translate-y-0.5 hover:shadow-md",
        alert
          ? "border-error/40 bg-error/[0.02] hover:border-error"
          : "border-border/80 hover:border-primary/40",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          {label}
        </p>
        <span
          className={[
            "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
            alert
              ? "bg-error/10 text-error"
              : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
          ].join(" ")}
        >
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4">
        <p className="font-serif text-3xl font-semibold tracking-tight text-text-heading">
          {value}
        </p>
        {(trend || description) && (
          <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
            {trend && (
              <span className="font-semibold text-primary">{trend}</span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
