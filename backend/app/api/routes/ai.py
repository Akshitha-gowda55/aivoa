from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])


class PlaceholderResponse(BaseModel):
    message: str


@router.get("", response_model=PlaceholderResponse)
def ai_placeholder() -> PlaceholderResponse:
    return PlaceholderResponse(message="Not implemented yet")
