export type AssessmentLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type DeviationStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "SUBMITTED"
  | "CLOSED";

export type Deviation = {
  id: string;
  deviation_number: string;
  site: string | null;
  date_of_occurrence: string | null;
  title: string;
  source: string | null;
  product: string | null;
  batch_number: string | null;
  description: string;
  impact_level: AssessmentLevel | null;
  impact_reason: string | null;
  severity_level: AssessmentLevel | null;
  severity_reason: string | null;
  status: DeviationStatus;
  created_at: string;
  updated_at: string;
};

export type ExtractedDeviation = {
  site: string | null;
  date_of_occurrence: string | null;
  title: string | null;
  source: string | null;
  product: string | null;
  batch_number: string | null;
  description: string | null;
};

export type KnowledgeMatch = {
  id: string;
  authority: string;
  source_type: string;
  title: string;
  topic: string;
  content: string;
  source_url: string | null;
  is_synthetic: boolean;
  match_score: number;
};

export type AIProcessingResponse = {
  extracted: ExtractedDeviation;
  impact: {
    level: AssessmentLevel;
    reason: string;
  };
  severity: {
    level: AssessmentLevel;
    reason: string;
  };
  knowledge_matches: KnowledgeMatch[];
  source_type: "pdf" | "text";
  processing_summary: string;
};

export type DeviationForm = {
  site: string;
  date_of_occurrence: string;
  title: string;
  source: string;
  product: string;
  batch_number: string;
  description: string;
  impact_level: AssessmentLevel | "";
  impact_reason: string;
  severity_level: AssessmentLevel | "";
  severity_reason: string;
};
