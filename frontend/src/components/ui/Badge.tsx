import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "info" | "warning" | "danger";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children: ReactNode;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  info: "border-slate-300 bg-slate-100 text-slate-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-800",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
