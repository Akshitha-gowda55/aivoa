import {
  ArrowRight,
  ClipboardList,
  FilePlus2,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listDeviations } from "@/lib/api";
import type { Deviation } from "@/types";

export function DeviationsPage() {
  const [items, setItems] = useState<Deviation[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDeviations()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    if (!normalized) return items;

    return items.filter((item) =>
      [
        item.deviation_number,
        item.title,
        item.product,
        item.batch_number,
        item.site,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized)),
    );
  }, [items, query]);

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Quality records
          </div>
          <h1>Deviations</h1>
          <p>Review and manage deviation records across the workflow.</p>
        </div>

        <Link to="/deviations/new" className="primary-button">
          <FilePlus2 size={16} />
          Log deviation
        </Link>
      </div>

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title">Deviation register</h2>
            <p className="section-subtitle">
              {items.length} total quality records
            </p>
          </div>

          <div className="relative w-full md:w-[280px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search deviations..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-emerald-300 focus:bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Loading deviations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <ClipboardList size={20} />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-700">
              No matching deviations
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try another search or create a new record.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                  <th className="table-head">Deviation</th>
                  <th className="table-head">Product / Batch</th>
                  <th className="table-head">Site</th>
                  <th className="table-head">Severity</th>
                  <th className="table-head">Status</th>
                  <th className="table-head" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="group transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <Link to={`/deviations/${item.id}`}>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                          {item.title}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {item.deviation_number}
                        </p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-slate-700">
                        {item.product || "—"}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {item.batch_number || "Batch not specified"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {item.site || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <LevelBadge level={item.severity_level} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/deviations/${item.id}`}>
                        <ArrowRight
                          size={15}
                          className="ml-auto text-slate-300 transition group-hover:text-emerald-500"
                        />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function LevelBadge({ level }: { level: string | null }) {
  if (!level) {
    return <span className="text-xs text-slate-300">—</span>;
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
        level === "CRITICAL"
          ? "bg-red-100 text-red-700"
          : level === "HIGH"
            ? "bg-orange-100 text-orange-700"
            : level === "MEDIUM"
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {level}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">
      {status.replace("_", " ")}
    </span>
  );
}
