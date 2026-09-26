import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-lg border border-slate-200 bg-white p-6 shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: CardProps) {
  return (
    <h2 className={cn("text-lg font-semibold text-slate-900", className)} {...props}>
      {children}
    </h2>
  );
}

export function CardDescription({ className, children, ...props }: CardProps) {
  return (
    <p className={cn("mt-2 text-sm leading-6 text-slate-600", className)} {...props}>
      {children}
    </p>
  );
}
