import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { store } from "@/app/store";
import { resetWorkflow } from "@/features/deviations/deviationSlice";
import { LogDeviationPage } from "@/pages/LogDeviationPage";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  processDeviationText: vi.fn(),
  processDeviationPdf: vi.fn(),
  createDeviation: vi.fn(),
}));

const mockAIResult = {
  extracted: {
    site: "Bangalore API Manufacturing Site",
    date_of_occurrence: "2026-09-26",
    title: "Granulation Temperature Excursion",
    source: "Manufacturing",
    product: "API Product A",
    batch_number: "BATCH-2026-001",
    description:
      "Granulation temperature exceeded the approved process parameter range for approximately 8 minutes.",
  },
  impact: {
    level: "MEDIUM" as const,
    reason:
      "The event may affect the manufacturing process, but no confirmed product quality impact has been established.",
  },
  severity: {
    level: "MEDIUM" as const,
    reason:
      "The deviation was limited in duration and detected through routine monitoring, but requires documented assessment.",
  },
  knowledge_matches: [
    {
      id: "kb-005",
      authority: "FDA",
      source_type: "regulatory",
      title: "Process parameter deviation and product impact assessment",
      topic: "process_parameter",
      content:
        "Process parameter deviations should be investigated for potential product impact.",
      source_url: "https://www.fda.gov/",
      is_synthetic: false,
      match_score: 0.35,
    },
  ],
  source_type: "text" as const,
  processing_summary:
    "AI extracted the deviation information, retrieved relevant quality and deviation patterns, and generated preliminary impact and severity recommendations for human review.",
};

const deviationText =
  "During manufacturing of API Product A at the Bangalore API Manufacturing Site on 26 September 2026, the granulation temperature exceeded the approved process parameter range for approximately 8 minutes in batch BATCH-2026-001. The event was identified during routine manufacturing monitoring. No confirmed product quality impact has been established. The deviation was reported by Manufacturing.";

function renderPage() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LogDeviationPage />
      </MemoryRouter>
    </Provider>,
  );
}

function switchToTextInput() {
  const pasteTextButtons = screen.getAllByRole("button", {
    name: "Paste text",
  });

  fireEvent.click(pasteTextButtons[0]);

  return screen.getByPlaceholderText(
    "Paste the deviation email, incident note, or event description...",
  );
}

describe("Log Deviation workflow", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    store.dispatch(resetWorkflow());
  });

  it("shows a validation message when processing text shorter than 20 characters", async () => {
    renderPage();

    const textarea = switchToTextInput();

    fireEvent.change(textarea, {
      target: { value: "short text" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Analyze deviation" }),
    );

    expect(
      await screen.findByText(
        "Paste at least 20 characters of deviation information.",
      ),
    ).toBeInTheDocument();

    expect(api.processDeviationText).not.toHaveBeenCalled();
  });

  it("processes deviation text and populates the form with AI extraction", async () => {
    vi.mocked(api.processDeviationText).mockResolvedValue(mockAIResult);

    renderPage();

    const textarea = switchToTextInput();

    fireEvent.change(textarea, {
      target: { value: deviationText },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Analyze deviation" }),
    );

    await waitFor(() => {
      expect(api.processDeviationText).toHaveBeenCalledTimes(1);
    });

    expect(api.processDeviationText).toHaveBeenCalledWith(deviationText);

    const titleInputs = await screen.findAllByPlaceholderText(
      "Concise description of the event",
    );
    expect(titleInputs[0]).toHaveValue("Granulation Temperature Excursion");

    expect(
      screen.getByPlaceholderText("Manufacturing site"),
    ).toHaveValue("Bangalore API Manufacturing Site");

    expect(
      screen.getByPlaceholderText("Batch / lot identifier"),
    ).toHaveValue("BATCH-2026-001");

    expect(
      screen.getByText("Human review required"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Process parameter deviation and product impact assessment",
      ),
    ).toBeInTheDocument();
  });

  it("submits the AI-populated deviation with SUBMITTED status", async () => {
    vi.mocked(api.processDeviationText).mockResolvedValue(mockAIResult);

    vi.mocked(api.createDeviation).mockResolvedValue({
      id: "deviation-test-id",
      deviation_number: "DEV-2026-0099",
      site: mockAIResult.extracted.site,
      date_of_occurrence: mockAIResult.extracted.date_of_occurrence,
      title: mockAIResult.extracted.title,
      source: mockAIResult.extracted.source,
      product: mockAIResult.extracted.product,
      batch_number: mockAIResult.extracted.batch_number,
      description: mockAIResult.extracted.description,
      impact_level: mockAIResult.impact.level,
      impact_reason: mockAIResult.impact.reason,
      severity_level: mockAIResult.severity.level,
      severity_reason: mockAIResult.severity.reason,
      status: "SUBMITTED",
      created_at: "2026-09-26T10:00:00Z",
      updated_at: "2026-09-26T10:00:00Z",
    });

    renderPage();

    const textarea = switchToTextInput();

    fireEvent.change(textarea, {
      target: { value: deviationText },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Analyze deviation" }),
    );

    await waitFor(() => {
      const titleInputs = screen.getAllByPlaceholderText(
        "Concise description of the event",
      );
      expect(titleInputs[0]).toHaveValue("Granulation Temperature Excursion");
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Submit deviation" })[0],
    );

    await waitFor(() => {
      expect(api.createDeviation).toHaveBeenCalledTimes(1);
    });

    expect(api.createDeviation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Granulation Temperature Excursion",
        batch_number: "BATCH-2026-001",
        impact_level: "MEDIUM",
        severity_level: "MEDIUM",
        status: "SUBMITTED",
      }),
    );
  });
});
