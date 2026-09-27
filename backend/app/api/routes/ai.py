from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.ai.graph import deviation_graph
from app.schemas.ai import AIProcessingResponse
from app.services.document_extractor import DocumentExtractionError, extract_pdf_text


router = APIRouter(prefix="/ai", tags=["ai"])


MAX_PDF_SIZE = 10 * 1024 * 1024


@router.post("/process", response_model=AIProcessingResponse)
async def process_deviation(
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
) -> AIProcessingResponse:
    if not text and not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either deviation text or a PDF file.",
        )

    if text and file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either text or a PDF file, not both.",
        )

    try:
        if file is not None:
            if file.content_type != "application/pdf":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only PDF files are supported.",
                )

            file_bytes = await file.read()

            if len(file_bytes) > MAX_PDF_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="PDF file must be 10 MB or smaller.",
                )

            source_text = extract_pdf_text(file_bytes)
            source_type = "pdf"

        else:
            source_text = text.strip() if text else ""

            if len(source_text) < 20:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Deviation text must contain at least 20 characters.",
                )

            source_type = "text"

        result = deviation_graph.invoke(
            {
                "source_text": source_text,
                "source_type": source_type,
            }
        )

        if result.get("error"):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=result["error"],
            )

        processing_result = result.get("result")

        if processing_result is None:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI processing did not produce a result.",
            )

        return AIProcessingResponse(
            extracted=processing_result.extracted.model_dump(mode="json"),
            impact=processing_result.impact.model_dump(mode="json"),
            severity=processing_result.severity.model_dump(mode="json"),
            knowledge_matches=[
                match.model_dump(mode="json")
                for match in processing_result.knowledge_matches
            ],
            source_type=processing_result.source_type,
            processing_summary=processing_result.processing_summary,
        )

    except DocumentExtractionError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI processing failed: {exc}",
        ) from exc
