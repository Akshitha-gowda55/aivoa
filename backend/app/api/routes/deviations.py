from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models.deviation import Deviation
from app.schemas.deviation import (
    DeviationCreate,
    DeviationResponse,
    DeviationUpdate,
)

router = APIRouter(prefix="/deviations", tags=["deviations"])


def generate_deviation_number(db: Session) -> str:
    year = __import__("datetime").datetime.now().year

    prefix = f"DEV-{year}-"

    latest = db.scalar(
        select(Deviation)
        .where(Deviation.deviation_number.like(f"{prefix}%"))
        .order_by(Deviation.deviation_number.desc())
    )

    if latest is None:
        sequence = 1
    else:
        sequence = int(latest.deviation_number.rsplit("-", 1)[1]) + 1

    return f"{prefix}{sequence:04d}"


@router.get("", response_model=list[DeviationResponse])
def list_deviations(
    db: Session = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[Deviation]:
    statement = (
        select(Deviation)
        .order_by(Deviation.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


@router.get("/{deviation_id}", response_model=DeviationResponse)
def get_deviation(
    deviation_id: UUID,
    db: Session = Depends(get_db),
) -> Deviation:
    deviation = db.get(Deviation, deviation_id)

    if deviation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deviation not found",
        )

    return deviation


@router.post(
    "",
    response_model=DeviationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_deviation(
    payload: DeviationCreate,
    db: Session = Depends(get_db),
) -> Deviation:
    deviation = Deviation(
        deviation_number=generate_deviation_number(db),
        **payload.model_dump(),
    )

    db.add(deviation)
    db.commit()
    db.refresh(deviation)

    return deviation


@router.patch("/{deviation_id}", response_model=DeviationResponse)
def update_deviation(
    deviation_id: UUID,
    payload: DeviationUpdate,
    db: Session = Depends(get_db),
) -> Deviation:
    deviation = db.get(Deviation, deviation_id)

    if deviation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deviation not found",
        )

    updates = payload.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(deviation, field, value)

    db.commit()
    db.refresh(deviation)

    return deviation


@router.delete(
    "/{deviation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_deviation(
    deviation_id: UUID,
    db: Session = Depends(get_db),
) -> None:
    deviation = db.get(Deviation, deviation_id)

    if deviation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deviation not found",
        )

    db.delete(deviation)
    db.commit()
