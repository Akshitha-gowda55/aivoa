from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.ai import router as ai_router
from app.api.routes.deviations import router as deviations_router
from app.api.routes.health import router as health_router
from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    logger.info("Starting AIVOA Deviation API in %s mode", settings.app_env)
    yield
    logger.info("Shutting down AIVOA Deviation API")


def create_app() -> FastAPI:
    application = FastAPI(
        title="AIVOA Deviation API",
        version="0.1.0",
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_exception_handlers(application)
    application.include_router(health_router, prefix="/api/v1")
    application.include_router(deviations_router, prefix="/api/v1")
    application.include_router(ai_router, prefix="/api/v1")
    return application


app = create_app()
