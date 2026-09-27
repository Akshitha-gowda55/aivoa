from typing import TypedDict

from app.ai.schemas import (
    AIProcessingResult,
    ExtractedDeviation,
    ImpactAssessment,
    KnowledgeMatch,
    SeverityAssessment,
)


class DeviationGraphState(TypedDict, total=False):
    source_text: str
    source_type: str

    extracted: ExtractedDeviation

    # Retrieved evidence used to support impact and severity assessment.
    retrieved_knowledge: list[KnowledgeMatch]

    impact: ImpactAssessment
    severity: SeverityAssessment

    result: AIProcessingResult
    error: str | None
