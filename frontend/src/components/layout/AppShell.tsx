import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
