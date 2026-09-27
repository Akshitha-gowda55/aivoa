from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.deviation import AssessmentLevel, DeviationStatus


class DeviationBase(BaseModel):
    site: str | None = Field(default=None, max_length=255)
    date_of_occurrence: date | None = None
    title: str = Field(min_length=1, max_length=500)
    source: str | None = Field(default=None, max_length=255)
    product: str | None = Field(default=None, max_length=255)
    batch_number: str | None = Field(default=None, max_length=255)
    description: str = Field(min_length=1)

    impact_level: AssessmentLevel | None = None
    impact_reason: str | None = None

    severity_level: AssessmentLevel | None = None
    severity_reason: str | None = None


class DeviationCreate(DeviationBase):
    status: DeviationStatus = DeviationStatus.DRAFT


class DeviationUpdate(BaseModel):
    site: str | None = Field(default=None, max_length=255)
    date_of_occurrence: date | None = None
    title: str | None = Field(default=None, min_length=1, max_length=500)
    source: str | None = Field(default=None, max_length=255)
    product: str | None = Field(default=None, max_length=255)
    batch_number: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, min_length=1)

    impact_level: AssessmentLevel | None = None
    impact_reason: str | None = None

    severity_level: AssessmentLevel | None = None
    severity_reason: str | None = None

    status: DeviationStatus | None = None


class DeviationResponse(DeviationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    deviation_number: str
    status: DeviationStatus
    created_at: datetime
    updated_at: datetime
