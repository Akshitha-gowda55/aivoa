import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-600" role="status">
      <LoaderCircle className={cn("h-4 w-4 animate-spin", className)} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
