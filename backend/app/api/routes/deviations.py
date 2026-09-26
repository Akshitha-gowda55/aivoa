from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/deviations", tags=["deviations"])


class PlaceholderResponse(BaseModel):
    message: str


@router.get("", response_model=PlaceholderResponse)
def list_deviations() -> PlaceholderResponse:
    return PlaceholderResponse(message="Not implemented yet")
