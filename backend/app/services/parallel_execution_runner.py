"""Parallel Execution Runner - Manages parallel autonomous task execution."""

import asyncio
import logging
from typing import Optional
from datetime import datetime, timezone

from .worktree_pool import WorktreePool
from .autonomous_task_worker import AutonomousTaskWorker
from app.database import async_session_maker
from app.models.autonomous import ExecutionSession, BatchExecution, TaskExecution
from sqlalchemy import select
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

# Global worktree pool
_global_worktree_pool: Optional[WorktreePool] = None


async def initialize_global_worktree_pool(pool_size: int = 3, base_dir: str = "../CC4-worktrees"):
    """Initialize the global worktree pool on application startup."""
    global _global_worktree_pool

    if _global_worktree_pool is not None:
        logger.warning("Worktree pool already initialized")
        return

    logger.info(f"Initializing global worktree pool: {pool_size} worktrees in {base_dir}")
    _global_worktree_pool = WorktreePool(
        pool_size=pool_size,
        base_dir=base_dir,
        repo_path=".",
    )

    await _global_worktree_pool.initialize()
    logger.info(f"Global worktree pool initialized with {pool_size} worktrees")


async def cleanup_global_worktree_pool():
    """Cleanup the global worktree pool on application shutdown."""
    global _global_worktree_pool

    if _global_worktree_pool is None:
        logger.warning("No worktree pool to cleanup")
        return

    logger.info("Cleaning up global worktree pool...")
    await _global_worktree_pool.cleanup()
    _global_worktree_pool = None
    logger.info("Global worktree pool cleaned up")


async def start_parallel_execution(execution_id: str, num_workers: int = 3):
    """
    Start parallel execution for an autonomous session.

    Args:
        execution_id: ID of the execution session
        num_workers: Number of parallel workers to use
    """
    global _global_worktree_pool

    if _global_worktree_pool is None:
        raise RuntimeError("Global worktree pool not initialized")

    logger.info(f"[{execution_id}] Starting parallel execution with {num_workers} workers")

    # Create and start workers
    workers = []
    worker_tasks = []

    for i in range(num_workers):
        worker_id = f"worker-{i+1}"
        worker = AutonomousTaskWorker(
            worker_id=worker_id,
            execution_id=execution_id,
            pool=_global_worktree_pool,
        )
        workers.append(worker)

        # Start worker task
        task = asyncio.create_task(
            worker.run(),
            name=f"autonomous-worker-{worker_id}"
        )
        worker_tasks.append(task)

    logger.info(f"[{execution_id}] {num_workers} workers started")

    # Workers will run in background and process batches as they come
    # No need to await them here - they'll run until the session is complete


async def get_worktree_pool() -> Optional[WorktreePool]:
    """Get the global worktree pool instance."""
    return _global_worktree_pool
