from enum import Enum

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.logging import get_logger

logger = get_logger(__name__)


class ErrorCode(str, Enum):
    VALIDATION_ERROR = "VALIDATION_ERROR"
    DOCUMENT_EXTRACTION_FAILED = "DOCUMENT_EXTRACTION_FAILED"
    AI_PROCESSING_FAILED = "AI_PROCESSING_FAILED"
    DATABASE_ERROR = "DATABASE_ERROR"
    NOT_FOUND = "NOT_FOUND"
    INTERNAL_ERROR = "INTERNAL_ERROR"


class AppError(Exception):
    def __init__(self, code: ErrorCode, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code


def error_payload(code: ErrorCode | str, message: str) -> dict[str, dict[str, str]]:
    return {"error": {"code": str(code), "message": message}}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
        logger.warning("Application error: %s", exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content=error_payload(exc.code, exc.message),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        _request: Request,
        _exc: RequestValidationError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=error_payload(ErrorCode.VALIDATION_ERROR, "Request validation failed"),
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
        code = ErrorCode.NOT_FOUND if exc.status_code == 404 else ErrorCode.INTERNAL_ERROR
        detail = exc.detail if isinstance(exc.detail, str) else "Request failed"
        return JSONResponse(status_code=exc.status_code, content=error_payload(code, detail))

    @app.exception_handler(SQLAlchemyError)
    async def database_error_handler(_request: Request, _exc: SQLAlchemyError) -> JSONResponse:
        logger.exception("Database error")
        return JSONResponse(
            status_code=500,
            content=error_payload(ErrorCode.DATABASE_ERROR, "A database error occurred"),
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(_request: Request, _exc: Exception) -> JSONResponse:
        logger.exception("Unhandled server error")
        return JSONResponse(
            status_code=500,
            content=error_payload(ErrorCode.INTERNAL_ERROR, "An unexpected error occurred"),
        )
