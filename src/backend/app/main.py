"""Main FastAPI application entry point for CodeSentinel AI backend."""

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import init_db
from app.api.v1.router import api_v1_router

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("codesentinel")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager."""
    logger.info("Starting CodeSentinel AI Multi-Agent Backend Engine...")
    init_db()
    logger.info("Database schema initialized successfully.")
    yield
    logger.info("Shutting down CodeSentinel AI Backend Engine.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Cognitive Multi-Agent LLM-based Autonomous Software Engineering Platform",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    """Health check endpoint confirming engine readiness."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "llm_provider": settings.LLM_PROVIDER,
        "active_model": settings.DEFAULT_MODEL,
        "agents": [
            "code_intelligence",
            "test_synthesis",
            "execution",
            "bug_detection",
            "root_cause_analysis",
            "patch_generation",
            "self_healing_validation",
        ],
    }


# Include v1 API routes
app.include_router(api_v1_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all unhandled exception handler to return structured error response."""
    logger.exception(f"Unhandled error processing {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": str(exc),
            "path": request.url.path,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
