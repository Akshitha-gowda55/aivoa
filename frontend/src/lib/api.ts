import type {
  AIProcessingResponse,
  Deviation,
  DeviationForm,
} from "@/types";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.error?.message ||
      "Something went wrong while communicating with the server.";

    throw new Error(message);
  }

  return data as T;
}

export async function processDeviationText(
  text: string,
): Promise<AIProcessingResponse> {
  const formData = new FormData();
  formData.append("text", text);

  const response = await fetch(`${API_BASE_URL}/ai/process`, {
    method: "POST",
    body: formData,
  });

  return parseResponse<AIProcessingResponse>(response);
}

export async function processDeviationPdf(
  file: File,
): Promise<AIProcessingResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/ai/process`, {
    method: "POST",
    body: formData,
  });

  return parseResponse<AIProcessingResponse>(response);
}

export async function listDeviations(): Promise<Deviation[]> {
  const response = await fetch(`${API_BASE_URL}/deviations`);
  return parseResponse<Deviation[]>(response);
}

export async function getDeviation(id: string): Promise<Deviation> {
  const response = await fetch(`${API_BASE_URL}/deviations/${id}`);
  return parseResponse<Deviation>(response);
}

export async function createDeviation(
  payload: Omit<DeviationForm, "impact_level" | "severity_level"> & {
    impact_level: DeviationForm["impact_level"];
    severity_level: DeviationForm["severity_level"];
    status?: "DRAFT" | "UNDER_REVIEW" | "SUBMITTED";
  },
): Promise<Deviation> {
  const response = await fetch(`${API_BASE_URL}/deviations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      impact_level: payload.impact_level || null,
      severity_level: payload.severity_level || null,
    }),
  });

  return parseResponse<Deviation>(response);
}

export async function updateDeviation(
  id: string,
  payload: Partial<DeviationForm> & {
    status?: "DRAFT" | "UNDER_REVIEW" | "SUBMITTED";
  },
): Promise<Deviation> {
  const response = await fetch(`${API_BASE_URL}/deviations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      impact_level: payload.impact_level || null,
      severity_level: payload.severity_level || null,
    }),
  });

  return parseResponse<Deviation>(response);
}
