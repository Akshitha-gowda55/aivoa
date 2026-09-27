from datetime import date
from enum import Enum

from pydantic import BaseModel, Field


class AssessmentLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ExtractedDeviation(BaseModel):
    site: str | None = Field(default=None)
    date_of_occurrence: date | None = Field(default=None)
    title: str | None = Field(default=None)
    source: str | None = Field(default=None)
    product: str | None = Field(default=None)
    batch_number: str | None = Field(default=None)
    description: str | None = Field(default=None)


class ImpactAssessment(BaseModel):
    level: AssessmentLevel
    reason: str


class SeverityAssessment(BaseModel):
    level: AssessmentLevel
    reason: str


class KnowledgeMatch(BaseModel):
    id: str
    authority: str
    source_type: str
    title: str
    topic: str
    content: str
    source_url: str | None = None
    is_synthetic: bool
    match_score: float


class AIProcessingResult(BaseModel):
    extracted: ExtractedDeviation
    impact: ImpactAssessment
    severity: SeverityAssessment
    knowledge_matches: list[KnowledgeMatch] = Field(default_factory=list)
    source_type: str
    processing_summary: str
