"""
Startup validation for CC4 backend.

Validates configuration, database connectivity, and worktree pool initialization
before server starts accepting requests.
"""

import logging
import sys
from pathlib import Path
from typing import Tuple

from sqlalchemy import text

from app.config import settings
from app.database import init_db, engine
from app.services.parallel_execution_runner import initialize_global_worktree_pool

logger = logging.getLogger(__name__)


class StartupValidationError(Exception):
    """Raised when startup validation fails."""

    pass


async def validate_config() -> Tuple[bool, str]:
    """
    Validate application configuration.

    Returns:
        Tuple of (is_valid, error_message)
    """
    errors = []

    # Validate required paths
    repo_path = Path(settings.repo_path)
    if not repo_path.exists():
        errors.append(f"Repository path does not exist: {settings.repo_path}")
    elif not repo_path.is_dir():
        errors.append(f"Repository path is not a directory: {settings.repo_path}")

    # Validate database URL format
    if not settings.database_url:
        errors.append("Database URL is not configured")
    elif not (
        settings.database_url.startswith("sqlite")
        or settings.database_url.startswith("postgresql")
    ):
        errors.append(
            f"Unsupported database URL format: {settings.database_url}. "
            "Must start with 'sqlite' or 'postgresql'"
        )

    # Validate API keys (warning only - not required for basic operation)
    if not settings.anthropic_api_key:
        logger.warning("ANTHROPIC_API_KEY not set - Claude Code features may be limited")

    # Validate CORS origins format
    if not settings.cors_origins:
        logger.warning("No CORS origins configured - frontend may have connection issues")

    if errors:
        return False, "; ".join(errors)

    return True, ""


async def validate_database() -> Tuple[bool, str]:
    """
    Validate database connectivity and initialization.

    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        # Initialize database tables
        logger.info("Initializing database tables...")
        await init_db()

        # Test database connectivity with a simple query
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))

        logger.info("Database validation successful")
        return True, ""

    except Exception as e:
        error_msg = f"Database validation failed: {str(e)}"
        logger.error(error_msg)
        return False, error_msg


async def validate_worktree_pool(
    pool_size: int = 3, base_dir: str = "../CC4-worktrees"
) -> Tuple[bool, str]:
    """
    Validate worktree pool initialization.

    Args:
        pool_size: Number of worktrees to create
        base_dir: Base directory for worktrees

    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        # Check that base directory parent exists
        base_path = Path(base_dir)
        parent_path = base_path.parent
        if not parent_path.exists():
            return (
                False,
                f"Worktree base directory parent does not exist: {parent_path}",
            )

        # Initialize worktree pool
        logger.info(f"Initializing worktree pool (size={pool_size}, base={base_dir})...")
        await initialize_global_worktree_pool(pool_size=pool_size, base_dir=base_dir)

        logger.info("Worktree pool validation successful")
        return True, ""

    except Exception as e:
        error_msg = f"Worktree pool validation failed: {str(e)}"
        logger.error(error_msg)
        return False, error_msg


async def run_startup_validation(
    pool_size: int = 3, base_dir: str = "../CC4-worktrees"
) -> None:
    """
    Run all startup validations.

    Validates configuration, database, and worktree pool.
    Exits with code 1 if any validation fails.

    Args:
        pool_size: Number of worktrees to create
        base_dir: Base directory for worktrees

    Raises:
        StartupValidationError: If validation fails
        SystemExit: If validation fails (exits with code 1)
    """
    logger.info("=" * 60)
    logger.info("Starting CC4 Backend - Running startup validation...")
    logger.info("=" * 60)

    # Step 1: Validate configuration
    logger.info("[1/3] Validating configuration...")
    config_valid, config_error = await validate_config()
    if not config_valid:
        logger.error(f"Configuration validation FAILED: {config_error}")
        logger.error("=" * 60)
        logger.error("STARTUP VALIDATION FAILED - Server will not start")
        logger.error("=" * 60)
        sys.exit(1)
    logger.info("[1/3] Configuration validation PASSED")

    # Step 2: Validate database
    logger.info("[2/3] Validating database...")
    db_valid, db_error = await validate_database()
    if not db_valid:
        logger.error(f"Database validation FAILED: {db_error}")
        logger.error("=" * 60)
        logger.error("STARTUP VALIDATION FAILED - Server will not start")
        logger.error("=" * 60)
        sys.exit(1)
    logger.info("[2/3] Database validation PASSED")

    # Step 3: Validate worktree pool
    logger.info("[3/3] Validating worktree pool...")
    pool_valid, pool_error = await validate_worktree_pool(
        pool_size=pool_size, base_dir=base_dir
    )
    if not pool_valid:
        logger.error(f"Worktree pool validation FAILED: {pool_error}")
        logger.error("=" * 60)
        logger.error("STARTUP VALIDATION FAILED - Server will not start")
        logger.error("=" * 60)
        sys.exit(1)
    logger.info("[3/3] Worktree pool validation PASSED")

    # All validations passed
    logger.info("=" * 60)
    logger.info("ALL STARTUP VALIDATIONS PASSED")
    logger.info(f"Server ready on {settings.host}:{settings.port}")
    logger.info("=" * 60)
