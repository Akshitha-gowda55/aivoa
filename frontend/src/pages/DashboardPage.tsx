import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  FilePlus2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listDeviations } from "@/lib/api";
import type { Deviation } from "@/types";

export function DashboardPage() {
  const [deviations, setDeviations] = useState<Deviation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDeviations()
      .then(setDeviations)
      .finally(() => setLoading(false));
  }, []);

  const open = deviations.filter((item) => item.status !== "CLOSED").length;
  const high = deviations.filter(
    (item) => item.severity_level === "HIGH" || item.severity_level === "CRITICAL",
  ).length;
  const drafts = deviations.filter((item) => item.status === "DRAFT").length;

  return (
    <div className="space-y-7">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Quality operations
          </div>
          <h1>Good evening, Quality team.</h1>
          <p>
            Monitor deviation activity and turn raw event information into
            review-ready quality records.
          </p>
        </div>

        <Link to="/deviations/new" className="primary-button">
          <FilePlus2 size={16} />
          Log deviation
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<ClipboardList size={18} />}
          label="Total deviations"
          value={deviations.length}
          caption="All recorded events"
        />
        <MetricCard
          icon={<AlertTriangle size={18} />}
          label="Open records"
          value={open}
          caption="Require active attention"
        />
        <MetricCard
          icon={<ShieldAlert size={18} />}
          label="High / critical"
          value={high}
          caption="AI severity recommendations"
        />
        <MetricCard
          icon={<Sparkles size={18} />}
          label="Drafts"
          value={drafts}
          caption="Awaiting review"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="section-title">Recent deviations</h2>
              <p className="section-subtitle">
                Latest quality events entering the workflow
              </p>
            </div>
            <Link to="/deviations" className="text-xs font-bold text-emerald-600">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-slate-400">Loading records...</div>
          ) : deviations.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <ClipboardList size={20} />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-700">
                No deviations yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Start with a PDF or event description.
              </p>
              <Link to="/deviations/new" className="secondary-button mt-5 inline-flex">
                Create first deviation
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {deviations.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  to={`/deviations/${item.id}`}
                  className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <ClipboardList size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {item.title}
                      </p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {item.deviation_number} · {item.product || "Product not specified"} ·{" "}
                      {item.batch_number || "Batch not specified"}
                    </p>
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Severity
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-700">
                      {item.severity_level || "—"}
                    </p>
                  </div>

                  <ArrowUpRight size={15} className="text-slate-300" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="relative overflow-hidden rounded-[24px] bg-slate-950 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.15)]">
          <div className="ai-glow" />
          <div className="relative">
            <div className="ai-icon mb-5">
              <Sparkles size={19} />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
              AIVOA Copilot
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">
              From event to
              <br />
              quality record.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Upload a deviation PDF or paste an event. AI extracts the record
              and prepares preliminary impact and severity recommendations.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "Extract facts from source",
                "Assess potential impact",
                "Recommend preliminary severity",
                "Human review before saving",
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-emerald-300">
                    {index + 1}
                  </span>
                  <span className="text-xs text-slate-300">{step}</span>
                </div>
              ))}
            </div>

            <Link
              to="/deviations/new"
              className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-50"
            >
              Start AI-assisted intake
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  caption,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          {icon}
        </div>
        <ArrowUpRight size={14} className="text-slate-300" />
      </div>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-[-0.04em] text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-slate-400">{caption}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    UNDER_REVIEW: "bg-amber-50 text-amber-700",
    SUBMITTED: "bg-blue-50 text-blue-700",
    CLOSED: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span className={`rounded-full px-2 py-1 text-[8px] font-bold ${styles[status] || styles.DRAFT}`}>
      {status.replace("_", " ")}
    </span>
  );
}
