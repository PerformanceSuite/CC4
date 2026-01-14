"""
CC4 - CommandCenter 4 Backend

Clean-slate rebuild of CommandCenter with hardened autonomous pipeline.

Features:
- FastAPI backend with health endpoint
- SQLite database for execution state
- Plan parser for markdown task plans
- Task executor using Claude Code CLI
- Worktree pool for parallel execution (92-97% efficiency)
- PR workflow (branch -> commit -> PR -> merge)
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers.autonomous import router as autonomous_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized")
    logger.info(f"CC4 backend starting on {settings.host}:{settings.port}")

    yield

    # Shutdown
    logger.info("Shutting down CC4 backend...")


app = FastAPI(
    title="CC4 - CommandCenter 4",
    description="Clean-slate rebuild of CommandCenter with hardened autonomous pipeline",
    version="4.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(autonomous_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "CC4 - CommandCenter 4",
        "version": "4.0.0",
        "status": "running",
        "pipeline": "worktree_pool",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=settings.host, port=settings.port)
