import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class DeviationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    UNDER_REVIEW = "UNDER_REVIEW"
    SUBMITTED = "SUBMITTED"
    CLOSED = "CLOSED"


class AssessmentLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Deviation(Base):
    __tablename__ = "deviations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    deviation_number: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        nullable=False,
        index=True,
    )

    site: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_of_occurrence: Mapped[date | None] = mapped_column(Date, nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    product: Mapped[str | None] = mapped_column(String(255), nullable=True)
    batch_number: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    impact_level: Mapped[AssessmentLevel | None] = mapped_column(
        Enum(AssessmentLevel, name="assessment_level"),
        nullable=True,
    )
    impact_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    severity_level: Mapped[AssessmentLevel | None] = mapped_column(
        Enum(AssessmentLevel, name="assessment_level"),
        nullable=True,
    )
    severity_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[DeviationStatus] = mapped_column(
        Enum(DeviationStatus, name="deviation_status"),
        nullable=False,
        default=DeviationStatus.DRAFT,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
