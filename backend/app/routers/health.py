"""
Health check endpoint for CC4 backend.

Provides comprehensive health status including:
- Database connection
- Worktree pool status
- Active execution count
- System uptime
- Version information
"""

import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.database import async_session
from app.services.parallel_execution_runner import get_worktree_pool
from app.models.autonomous import AutonomousSession, SessionStatus

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["health"])

# Track application start time
_app_start_time = time.time()


async def check_database() -> Dict[str, Any]:
    """
    Check database connectivity and perform a simple query.

    Returns:
        Dictionary with status, healthy flag, and optional error message
    """
    try:
        async with async_session() as session:
            # Simple ping query
            result = await session.execute(text("SELECT 1"))
            result.scalar()

            return {
                "status": "connected",
                "healthy": True,
            }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "error",
            "healthy": False,
            "error": str(e),
        }


async def check_worktree_pool() -> Dict[str, Any]:
    """
    Check worktree pool status.

    Returns:
        Dictionary with pool status, counts, and healthy flag
    """
    try:
        pool = await get_worktree_pool()

        if pool is None:
            return {
                "status": "not_initialized",
                "healthy": False,
                "message": "Worktree pool not initialized",
            }

        # Get pool statistics
        free_count = pool.num_free
        busy_count = pool.num_busy
        error_count = pool.num_error
        total_count = pool.pool_size

        # Pool is healthy if initialized and has no errors
        is_healthy = error_count == 0

        return {
            "status": "initialized",
            "healthy": is_healthy,
            "available": free_count,
            "busy": busy_count,
            "error": error_count,
            "total": total_count,
            "utilization_percent": round((busy_count / total_count * 100), 1) if total_count > 0 else 0,
        }
    except Exception as e:
        logger.error(f"Worktree pool health check failed: {e}")
        return {
            "status": "error",
            "healthy": False,
            "error": str(e),
        }


async def get_active_executions() -> Dict[str, Any]:
    """
    Get count of active autonomous execution sessions.

    Returns:
        Dictionary with active execution count and details
    """
    try:
        async with async_session() as session:
            # Count active sessions (started, paused, executing)
            from sqlalchemy import select, func

            active_statuses = [
                SessionStatus.STARTED.value,
                SessionStatus.PAUSED.value,
                SessionStatus.EXECUTING.value,
            ]

            result = await session.execute(
                select(func.count(AutonomousSession.id))
                .where(AutonomousSession.status.in_(active_statuses))
            )
            active_count = result.scalar() or 0

            return {
                "active_count": active_count,
                "healthy": True,
            }
    except Exception as e:
        logger.error(f"Active executions check failed: {e}")
        return {
            "active_count": 0,
            "healthy": False,
            "error": str(e),
        }


def get_system_info() -> Dict[str, Any]:
    """
    Get system information including uptime and version.

    Returns:
        Dictionary with system information
    """
    uptime_seconds = int(time.time() - _app_start_time)

    # Calculate uptime in human-readable format
    days = uptime_seconds // 86400
    hours = (uptime_seconds % 86400) // 3600
    minutes = (uptime_seconds % 3600) // 60
    seconds = uptime_seconds % 60

    uptime_str = []
    if days > 0:
        uptime_str.append(f"{days}d")
    if hours > 0:
        uptime_str.append(f"{hours}h")
    if minutes > 0:
        uptime_str.append(f"{minutes}m")
    uptime_str.append(f"{seconds}s")

    return {
        "version": "4.0.0",
        "uptime_seconds": uptime_seconds,
        "uptime": " ".join(uptime_str),
        "started_at": datetime.fromtimestamp(_app_start_time, tz=timezone.utc).isoformat(),
    }


@router.get("/health")
async def health_check():
    """
    Enhanced health check endpoint.

    Returns comprehensive health status including:
    - Overall status (healthy/degraded/unhealthy)
    - Database connection status
    - Worktree pool status
    - Active execution count
    - System uptime and version

    Status codes:
    - 200: System is healthy
    - 503: System is degraded or unhealthy
    """
    # Perform all health checks
    db_status = await check_database()
    pool_status = await check_worktree_pool()
    executions = await get_active_executions()
    system_info = get_system_info()

    # Determine overall health
    components = {
        "database": db_status,
        "worktree_pool": pool_status,
        "executions": executions,
        "system": system_info,
    }

    # Calculate overall status
    all_healthy = (
        db_status.get("healthy", False) and
        pool_status.get("healthy", False) and
        executions.get("healthy", True)  # Executions check is informational
    )

    overall_status = "healthy" if all_healthy else "degraded"
    http_status = status.HTTP_200_OK if all_healthy else status.HTTP_503_SERVICE_UNAVAILABLE

    response = {
        "status": overall_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "components": components,
    }

    return JSONResponse(
        status_code=http_status,
        content=response,
    )


@router.get("/health/simple")
async def simple_health_check():
    """
    Simple health check endpoint for basic monitoring.

    Returns minimal response indicating service is running.
    Useful for load balancers and basic uptime checks.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
