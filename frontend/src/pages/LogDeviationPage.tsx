import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  FileText,
  ExternalLink,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import {
  applyAIResult,
  setFormField,
  setProcessing,
  setProcessingError,
  setSaving,
  setSaveError,
} from "@/features/deviations/deviationSlice";
import {
  createDeviation,
  processDeviationPdf,
  processDeviationText,
} from "@/lib/api";
import type {
  AIProcessingResponse,
  AssessmentLevel,
  DeviationForm,
} from "@/types";

const levelStyles: Record<AssessmentLevel, string> = {
  LOW: "level-low",
  MEDIUM: "level-medium",
  HIGH: "level-high",
  CRITICAL: "level-critical",
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="field-group">
      <span className="field-label">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
      />
    </label>
  );
}

export function LogDeviationPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useAppSelector((state) => state.deviationWorkflow.form);
  const aiResult = useAppSelector(
    (state) => state.deviationWorkflow.aiResult,
  );
  const processing = useAppSelector(
    (state) => state.deviationWorkflow.isProcessing,
  );
  const saving = useAppSelector(
    (state) => state.deviationWorkflow.isSaving,
  );
  const processingError = useAppSelector(
    (state) => state.deviationWorkflow.processingError,
  );
  const saveError = useAppSelector(
    (state) => state.deviationWorkflow.saveError,
  );

  const [sourceText, setSourceText] = useState("");
  const [activeInput, setActiveInput] = useState<"pdf" | "text">("pdf");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  const error = processingError ?? saveError;

  const updateField = <K extends keyof DeviationForm>(
    key: K,
    value: DeviationForm[K],
  ) => {
    dispatch(
      setFormField({
        field: key,
        value: String(value),
      }),
    );
  };

  const handleAIResult = (result: AIProcessingResponse) => {
    dispatch(applyAIResult(result));
  };

  const processText = async () => {
    if (sourceText.trim().length < 20) {
      dispatch(
        setProcessingError(
          "Paste at least 20 characters of deviation information.",
        ),
      );
      return;
    }

    dispatch(setProcessingError(null));
    dispatch(setProcessing(true));

    try {
      const result = await processDeviationText(sourceText.trim());
      handleAIResult(result);
    } catch (err) {
      dispatch(
        setProcessingError(
          err instanceof Error ? err.message : "AI processing failed.",
        ),
      );
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      dispatch(setProcessingError("Only PDF documents are supported."));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      dispatch(setProcessingError("PDF must be smaller than 10 MB."));
      return;
    }

    dispatch(setProcessingError(null));
    setFileName(file.name);
    dispatch(setProcessing(true));

    try {
      const result = await processDeviationPdf(file);
      handleAIResult(result);
    } catch (err) {
      dispatch(
        setProcessingError(
          err instanceof Error ? err.message : "PDF processing failed.",
        ),
      );
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleSave = async (status: "DRAFT" | "SUBMITTED") => {
    if (!form.title.trim() || !form.description.trim()) {
      dispatch(
        setSaveError("Title and description are required before saving."),
      );
      return;
    }

    dispatch(setSaveError(null));
    dispatch(setSaving(true));

    try {
      const deviation = await createDeviation({
        ...form,
        status,
      });

      navigate(`/deviations/${deviation.id}`);
    } catch (err) {
      dispatch(
        setSaveError(
          err instanceof Error ? err.message : "Unable to save deviation.",
        ),
      );
    } finally {
      dispatch(setSaving(false));
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Deviation management
          </div>
          <h1>Log a deviation</h1>
          <p>
            Let AI structure the event first. Review every recommendation before
            it becomes part of the quality record.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
          <Sparkles size={14} />
          AI-assisted workflow
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_410px]">
        <section className="order-2 rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)] xl:order-1">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="section-icon">
                <ClipboardCheck size={18} />
              </div>
              <div>
                <h2 className="section-title">Deviation record</h2>
                <p className="section-subtitle">
                  AI-populated fields remain editable for human review.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {aiResult && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={15} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900">
                    AI extraction complete
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-emerald-700">
                    Review the extracted information and recommendations below
                    before saving this deviation.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Site"
                value={form.site}
                onChange={(value) => updateField("site", value)}
                placeholder="Manufacturing site"
              />

              <Field
                label="Date of occurrence"
                value={form.date_of_occurrence}
                onChange={(value) => updateField("date_of_occurrence", value)}
                type="date"
              />

              <div className="sm:col-span-2">
                <Field
                  label="Deviation title"
                  value={form.title}
                  onChange={(value) => updateField("title", value)}
                  placeholder="Concise description of the event"
                />
              </div>

              <Field
                label="Source"
                value={form.source}
                onChange={(value) => updateField("source", value)}
                placeholder="Manufacturing / QA / etc."
              />

              <Field
                label="Product"
                value={form.product}
                onChange={(value) => updateField("product", value)}
                placeholder="Product name"
              />

              <Field
                label="Batch number"
                value={form.batch_number}
                onChange={(value) => updateField("batch_number", value)}
                placeholder="Batch / lot identifier"
              />

              <label className="field-group sm:col-span-2">
                <span className="field-label">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Describe what happened..."
                  rows={7}
                  className="field-input min-h-[150px] resize-y"
                />
              </label>
            </div>

            <div className="my-7 h-px bg-slate-100" />

            <div className="mb-4">
              <p className="text-sm font-medium text-slate-900">
                AI assessment
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Preliminary recommendations. Final assessment remains with the
                quality team.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AssessmentCard
                label="Potential impact"
                level={form.impact_level}
                reason={form.impact_reason}
                onReasonChange={(value) =>
                  updateField("impact_reason", value)
                }
                onLevelChange={(value) =>
                  updateField("impact_level", value)
                }
              />

              <AssessmentCard
                label="Severity"
                level={form.severity_level}
                reason={form.severity_reason}
                onReasonChange={(value) =>
                  updateField("severity_reason", value)
                }
                onLevelChange={(value) =>
                  updateField("severity_level", value)
                }
              />
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="secondary-button"
                disabled={saving}
                onClick={() => void handleSave("DRAFT")}
              >
                Save draft
              </button>

              <button
                type="button"
                className="primary-button"
                disabled={saving}
                onClick={() => void handleSave("SUBMITTED")}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Submit deviation
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="order-1 h-fit xl:sticky xl:top-[100px] xl:order-2">
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <div className="relative overflow-hidden border-b border-white/10 px-5 py-5">
              <div className="ai-glow" />
              <div className="relative flex items-center gap-3">
                <div className="ai-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">AIVOA Copilot</p>
                  <p className="text-[11px] text-slate-400">
                    Deviation intelligence
                  </p>
                </div>
                <span className="ml-auto rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[11px] font-medium text-emerald-300">
                  AI ready
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-5">
                <p className="text-sm font-medium text-white">
                  Start from the source
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Upload the deviation PDF or paste the event description.
                  AIVOA will structure the record for review.
                </p>
              </div>

              <div className="mb-4 grid grid-cols-2 rounded-xl bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setActiveInput("pdf")}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    activeInput === "pdf"
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  PDF document
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInput("text")}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    activeInput === "text"
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Paste text
                </button>
              </div>

              {activeInput === "pdf" ? (
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    const file = event.dataTransfer.files[0];

                    if (file) {
                      void processFile(file);
                    }
                  }}
                  className={`upload-zone ${
                    dragging ? "upload-zone-active" : ""
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        void processFile(file);
                      }
                    }}
                  />

                  {processing ? (
                    <>
                      <Loader2
                        size={26}
                        className="animate-spin text-emerald-400"
                      />
                      <span className="mt-3 text-sm font-medium text-white">
                        Reading and assessing...
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        Extraction → impact → severity
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="upload-icon">
                        <UploadCloud size={21} />
                      </div>
                      <span className="mt-3 text-sm font-medium text-white">
                        Drop a PDF here
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        or click to browse · max 10 MB
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div>
                  <textarea
                    value={sourceText}
                    onChange={(event) => setSourceText(event.target.value)}
                    placeholder="Paste the deviation email, incident note, or event description..."
                    rows={10}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-5 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
                  />

                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => void processText()}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Processing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        Analyze deviation
                      </>
                    )}
                  </button>
                </div>
              )}

              {fileName && !processing && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <FileText size={14} className="text-emerald-400" />
                  <span className="min-w-0 flex-1 truncate text-[11px] text-slate-300">
                    {fileName}
                  </span>
                  <Check size={13} className="text-emerald-400" />
                </div>
              )}

              {aiResult && !processing && (
                <div className="mt-5 space-y-2">
                  <p className="text-[11px] font-medium text-slate-500">
                    Analysis complete
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] font-medium text-slate-500">
                        Impact
                      </p>
                      <p
                        className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${levelStyles[aiResult.impact.level]}`}
                      >
                        {aiResult.impact.level}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] font-medium text-slate-500">
                        Severity
                      </p>
                      <p
                        className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${levelStyles[aiResult.severity.level]}`}
                      >
                        {aiResult.severity.level}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-400/10 bg-amber-400/5 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-300">
                      <AlertCircle size={12} />
                      Human review required
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      AI recommendations are advisory and can be edited before
                      submission.
                    </p>
                  </div>

                  {aiResult.knowledge_matches.length > 0 && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                          <BookOpen size={12} className="text-emerald-400" />
                          Evidence used by AI
                        </p>
                        <span className="text-[9px] text-slate-500">
                          {aiResult.knowledge_matches.length} matches
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="mb-2 text-[11px] font-medium text-blue-300">
                          Regulatory context
                        </p>

                        <div className="space-y-2">
                          {aiResult.knowledge_matches
                            .filter((match) => !match.is_synthetic)
                            .slice(0, 3)
                            .map((match) => (
                              <div
                                key={match.id}
                                className="rounded-lg border border-blue-400/10 bg-blue-400/[0.03] p-2.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-[10px] font-semibold leading-4 text-slate-200">
                                    {match.title}
                                  </p>

                                  <span className="shrink-0 rounded-full bg-blue-400/10 px-1.5 py-0.5 text-[8px] font-bold text-blue-300">
                                    {match.authority}
                                  </span>
                                </div>

                                <p className="mt-1.5 text-[9px] leading-4 text-slate-500">
                                  {match.content}
                                </p>

                                {match.source_url && (
                                  <a
                                    href={match.source_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-medium text-emerald-400 hover:text-emerald-300"
                                  >
                                    View source
                                    <ExternalLink size={9} />
                                  </a>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[11px] font-medium text-violet-300">
                          Demonstration patterns
                        </p>

                        <div className="space-y-2">
                          {aiResult.knowledge_matches
                            .filter((match) => match.is_synthetic)
                            .filter((match) => match.topic !== "evidence_gap")
                            .slice(0, 2)
                            .map((match) => (
                              <div
                                key={match.id}
                                className="rounded-lg border border-violet-400/10 bg-violet-400/[0.03] p-2.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-[10px] font-semibold leading-4 text-slate-200">
                                    {match.title}
                                  </p>

                                  <span className="shrink-0 rounded-full bg-violet-400/10 px-1.5 py-0.5 text-[8px] font-bold text-violet-300">
                                    Synthetic demo
                                  </span>
                                </div>

                                <p className="mt-1.5 text-[9px] leading-4 text-slate-500">
                                  {match.content}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {aiResult.knowledge_matches.some(
                    (match) => match.topic === "evidence_gap",
                  ) && (
                    <div className="rounded-xl border border-orange-400/10 bg-orange-400/5 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold text-orange-300">
                        <AlertTriangle size={12} />
                        Evidence gaps
                      </p>

                      <div className="mt-2 space-y-1">
                        {aiResult.knowledge_matches
                          .filter((match) => match.topic === "evidence_gap")
                          .slice(0, 2)
                          .map((match) => (
                            <p
                              key={match.id}
                              className="text-[9px] leading-4 text-slate-500"
                            >
                              {match.content}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] text-slate-500">
                <Sparkles size={11} className="text-emerald-400" />
                Structured extraction powered by your AIVOA AI workflow
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AssessmentCard({
  label,
  level,
  reason,
  onLevelChange,
  onReasonChange,
}: {
  label: string;
  level: AssessmentLevel | "";
  reason: string;
  onLevelChange: (value: AssessmentLevel | "") => void;
  onReasonChange: (value: string) => void;
}) {
  const levels: AssessmentLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">{label}</p>

        {level && (
          <span
            className={`rounded-full px-2 py-1 text-[9px] font-bold ${levelStyles[level]}`}
          >
            AI: {level}
          </span>
        )}
      </div>

      <select
        value={level}
        onChange={(event) =>
          onLevelChange(event.target.value as AssessmentLevel | "")
        }
        className="field-input mb-3"
      >
        <option value="">Not assessed</option>

        {levels.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <textarea
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        rows={3}
        placeholder="AI rationale..."
        className="field-input resize-none text-xs"
      />
    </div>
  );
}
