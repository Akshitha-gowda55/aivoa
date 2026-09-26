import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

type ErrorStateProps = {
  title?: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-6">
      <AlertTriangle className="h-5 w-5 text-red-800" aria-hidden="true" />
      <div>
        <h3 className="text-sm font-semibold text-red-900">{title}</h3>
        <p className="mt-1 text-sm text-red-800">{description}</p>
      </div>
      {action}
    </div>
  );
}
