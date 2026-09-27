from pydantic import BaseModel, Field


class AITextRequest(BaseModel):
    text: str = Field(min_length=20, max_length=50_000)


class AIProcessingResponse(BaseModel):
    extracted: dict
    impact: dict
    severity: dict
    knowledge_matches: list[dict] = Field(default_factory=list)
    source_type: str
    processing_summary: str
