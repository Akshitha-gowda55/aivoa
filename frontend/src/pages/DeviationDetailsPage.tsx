import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Factory,
  Package,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getDeviation } from "@/lib/api";
import type { Deviation } from "@/types";

export function DeviationDetailsPage() {
  const { id } = useParams();
  const [item, setItem] = useState<Deviation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getDeviation(id)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-10 text-sm text-slate-400">Loading deviation...</div>;
  }

  if (!item) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-bold">Deviation not found</p>
        <Link to="/deviations" className="mt-4 inline-flex text-xs text-emerald-600">
          Return to deviations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/deviations"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-slate-700"
      >
        <ArrowLeft size={14} />
        Back to deviations
      </Link>

      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            {item.deviation_number}
          </div>
          <h1>{item.title}</h1>
          <p>
            Recorded on{" "}
            {item.date_of_occurrence
              ? new Date(item.date_of_occurrence).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "date not specified"}
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
          {item.status.replace("_", " ")}
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={<Factory size={17} />} label="Site" value={item.site || "—"} />
        <InfoCard icon={<Package size={17} />} label="Product" value={item.product || "—"} />
        <InfoCard icon={<ClipboardList size={17} />} label="Batch" value={item.batch_number || "—"} />
        <InfoCard
          icon={<CalendarDays size={17} />}
          label="Source"
          value={item.source || "—"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3">
            <div className="section-icon">
              <ClipboardList size={18} />
            </div>
            <div>
              <h2 className="section-title">Event description</h2>
              <p className="section-subtitle">Recorded deviation information</p>
            </div>
          </div>

          <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {item.description}
          </p>
        </section>

        <section className="relative overflow-hidden rounded-[24px] bg-slate-950 p-6 text-white">
          <div className="ai-glow" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="ai-icon">
                <Sparkles size={17} />
              </div>
              <div>
                <p className="text-sm font-bold">AI assessment</p>
                <p className="text-[10px] text-slate-500">
                  Preliminary recommendation
                </p>
              </div>
            </div>

            <Assessment
              label="Potential impact"
              level={item.impact_level}
              reason={item.impact_reason}
            />

            <Assessment
              label="Severity"
              level={item.severity_level}
              reason={item.severity_reason}
            />

            <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-400/10 bg-amber-400/5 p-3">
              <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber-300" />
              <p className="text-[10px] leading-4 text-slate-400">
                AI output is advisory. Final quality decisions remain with the
                responsible reviewer.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>
      <p className="mt-4 text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-bold text-slate-700">{value}</p>
    </div>
  );
}

function Assessment({
  label,
  level,
  reason,
}: {
  label: string;
  level: string | null;
  reason: string | null;
}) {
  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        {level && (
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold text-emerald-300">
            {level}
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
        <p className="text-xs leading-5 text-slate-300">{reason || "No rationale provided."}</p>
      </div>
    </div>
  );
}
