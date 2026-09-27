import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  Activity,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type AppShellProps = {
  children: ReactNode;
};

const navigation = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/deviations", label: "Deviations", icon: ClipboardList },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[246px] flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-[76px] items-center border-b border-slate-100 px-6">
          <div className="brand-mark mr-3">
            <ShieldCheck size={19} strokeWidth={2.3} />
          </div>

          <div>
            <div className="text-[17px] font-bold tracking-[-0.03em] text-slate-950">
              AIVOA
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Quality intelligence
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-6">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </div>

          <nav className="space-y-1">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-7 mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Actions
          </div>

          <NavLink to="/deviations/new" className="sidebar-create">
            <FilePlus2 size={17} />
            <span>Log deviation</span>
          </NavLink>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <Sparkles size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">AI Copilot</p>
                <p className="text-[10px] text-slate-400">Ready to assist</p>
              </div>
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 px-2 text-[11px] text-slate-400">
            <Settings2 size={13} />
            <span>Quality workspace</span>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[246px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="brand-mark">
              <ShieldCheck size={18} />
            </div>
            <span className="font-bold tracking-tight">AIVOA</span>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <Activity size={14} className="text-emerald-500" />
            <span>Quality operations workspace</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-slate-700">Quality team</p>
              <p className="text-[10px] text-slate-400">Manufacturing operations</p>
            </div>
            <div className="avatar">Q</div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
