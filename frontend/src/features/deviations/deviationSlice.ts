import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AIProcessingResponse,
  AssessmentLevel,
  DeviationForm,
} from "@/types";

type DeviationWorkflowState = {
  form: DeviationForm;
  aiResult: AIProcessingResponse | null;
  isProcessing: boolean;
  processingError: string | null;
  isSaving: boolean;
  saveError: string | null;
};

const initialForm: DeviationForm = {
  site: "",
  date_of_occurrence: "",
  title: "",
  source: "",
  product: "",
  batch_number: "",
  description: "",
  impact_level: "",
  impact_reason: "",
  severity_level: "",
  severity_reason: "",
};

const initialState: DeviationWorkflowState = {
  form: initialForm,
  aiResult: null,
  isProcessing: false,
  processingError: null,
  isSaving: false,
  saveError: null,
};

const deviationSlice = createSlice({
  name: "deviationWorkflow",
  initialState,
  reducers: {
    setFormField: (
      state,
      action: PayloadAction<{
        field: keyof DeviationForm;
        value: string;
      }>,
    ) => {
      state.form[action.payload.field] = action.payload.value as never;
    },

    applyAIResult: (
      state,
      action: PayloadAction<AIProcessingResponse>,
    ) => {
      const result = action.payload;

      state.aiResult = result;
      state.form = {
        ...state.form,
        site: result.extracted.site ?? "",
        date_of_occurrence: result.extracted.date_of_occurrence ?? "",
        title: result.extracted.title ?? "",
        source: result.extracted.source ?? "",
        product: result.extracted.product ?? "",
        batch_number: result.extracted.batch_number ?? "",
        description: result.extracted.description ?? "",
        impact_level: result.impact.level ?? "",
        impact_reason: result.impact.reason ?? "",
        severity_level: result.severity.level ?? "",
        severity_reason: result.severity.reason ?? "",
      };
      state.processingError = null;
    },

    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
      if (action.payload) {
        state.processingError = null;
      }
    },

    setProcessingError: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.processingError = action.payload;
      state.isProcessing = false;
    },

    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
      if (action.payload) {
        state.saveError = null;
      }
    },

    setSaveError: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.saveError = action.payload;
      state.isSaving = false;
    },

    setImpactLevel: (
      state,
      action: PayloadAction<AssessmentLevel | "">,
    ) => {
      state.form.impact_level = action.payload;
    },

    setSeverityLevel: (
      state,
      action: PayloadAction<AssessmentLevel | "">,
    ) => {
      state.form.severity_level = action.payload;
    },

    resetWorkflow: () => initialState,
  },
});

export const {
  setFormField,
  applyAIResult,
  setProcessing,
  setProcessingError,
  setSaving,
  setSaveError,
  setImpactLevel,
  setSeverityLevel,
  resetWorkflow,
} = deviationSlice.actions;

export default deviationSlice.reducer;
