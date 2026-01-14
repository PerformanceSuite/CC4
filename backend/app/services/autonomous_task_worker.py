"""Autonomous Task Worker - Executes autonomous tasks in isolated worktrees."""

import asyncio
import logging
from typing import Optional
from datetime import datetime, timezone
from pathlib import Path

from .worktree_pool import WorktreePool, WorktreeInfo, WorktreeAcquisitionTimeout
from .task_executor import TaskExecutor
from app.database import async_session
from app.models.autonomous import AutonomousSession, BatchExecution, TaskExecution, TaskStatus
from sqlalchemy import select
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)


class AutonomousTaskWorker:
    """
    Worker that executes autonomous tasks using worktrees from the pool.

    Each worker continuously checks for pending tasks, acquires a worktree,
    executes the task in isolation, and releases the worktree back to the pool.
    """

    def __init__(
        self,
        worker_id: str,
        execution_id: str,
        pool: WorktreePool,
        task_timeout_seconds: float = 1800.0,  # 30 minutes default
        worktree_acquire_timeout: float = 300.0,  # 5 minutes default
        skip_github_ops: bool = False,  # For benchmarking/testing
    ):
        """
        Initialize autonomous task worker.

        Args:
            worker_id: Unique identifier for this worker (e.g., "worker-1")
            execution_id: ID of the execution session this worker serves
            pool: Worktree pool to acquire worktrees from
            task_timeout_seconds: Maximum time for a single task (default: 30 min)
            worktree_acquire_timeout: Maximum time to wait for a worktree (default: 5 min)
            skip_github_ops: If True, skip push/PR/merge operations (for local testing)
        """
        self.worker_id = worker_id
        self.execution_id = execution_id
        self.pool = pool
        self.task_timeout_seconds = task_timeout_seconds
        self.worktree_acquire_timeout = worktree_acquire_timeout
        self.skip_github_ops = skip_github_ops
        self.is_running = False
        self.current_task: Optional[TaskExecution] = None

    async def run(self):
        """Main worker loop - continuously process tasks until session is complete."""
        self.is_running = True
        logger.info(f"[{self.worker_id}] Started for execution {self.execution_id}")

        try:
            while self.is_running:
                # Check if execution is still active
                async with async_session() as session:
                    result = await session.execute(
                        select(AutonomousSession).where(AutonomousSession.id == self.execution_id)
                    )
                    exec_session = result.scalar_one_or_none()

                    if not exec_session or exec_session.status in ["completed", "failed", "cancelled"]:
                        logger.info(f"[{self.worker_id}] Execution {self.execution_id} is done, shutting down")
                        break

                # Find next pending task
                task = await self._get_next_pending_task()

                if task is None:
                    # No pending tasks, wait a bit and check again
                    await asyncio.sleep(2)
                    continue

                # Execute the task
                await self._execute_task(task)

        except Exception as e:
            logger.error(f"[{self.worker_id}] Fatal error: {e}", exc_info=True)
        finally:
            self.is_running = False
            logger.info(f"[{self.worker_id}] Stopped")

    async def _get_next_pending_task(self) -> Optional[TaskExecution]:
        """
        Find the next pending task to execute using atomic update.

        Uses a two-phase approach to prevent race conditions with SQLite:
        1. Find a pending task ID
        2. Atomically claim it with UPDATE WHERE status=PENDING

        This works better than SELECT...FOR UPDATE with SQLite, which doesn't
        properly support row-level locking with skip_locked.
        """
        from sqlalchemy import update

        async with async_session() as session:
            # Phase 1: Find next pending task ID
            result = await session.execute(
                select(TaskExecution.id)
                .join(BatchExecution)
                .where(
                    BatchExecution.session_id == self.execution_id,
                    TaskExecution.status == TaskStatus.PENDING.value
                )
                .order_by(BatchExecution.batch_number, TaskExecution.task_number)
                .limit(1)
            )
            task_id = result.scalar_one_or_none()

            if not task_id:
                return None

            # Phase 2: Atomically claim the task
            # Only succeeds if status is still PENDING (prevents race conditions)
            stmt = (
                update(TaskExecution)
                .where(
                    TaskExecution.id == task_id,
                    TaskExecution.status == TaskStatus.PENDING.value  # Critical: only update if still PENDING
                )
                .values(
                    status=TaskStatus.IN_PROGRESS.value,
                    started_at=datetime.now(timezone.utc)
                )
            )
            result = await session.execute(stmt)
            await session.commit()

            # Check if we actually claimed the task
            if result.rowcount == 0:
                # Another worker claimed it first, return None to try again
                logger.debug(f"[{self.worker_id}] Task {task_id} was claimed by another worker")
                return None

            # Fetch the task we just claimed
            result = await session.execute(
                select(TaskExecution).where(TaskExecution.id == task_id)
            )
            task = result.scalar_one()
            logger.info(f"[{self.worker_id}] Successfully claimed task {task_id}")

            return task

    async def _execute_task(self, task: TaskExecution):
        """Execute a single task in an isolated worktree."""
        self.current_task = task
        worktree: Optional[WorktreeInfo] = None

        try:
            logger.info(f"[{self.worker_id}] Executing task {task.id} (batch {task.batch_execution_id})")

            # Acquire worktree from pool
            try:
                worktree = await asyncio.wait_for(
                    self.pool.acquire(test_name=str(task.id)),
                    timeout=self.worktree_acquire_timeout
                )
                logger.info(f"[{self.worker_id}] Acquired {worktree.id} for task {task.id}")
            except asyncio.TimeoutError:
                raise WorktreeAcquisitionTimeout(
                    f"Failed to acquire worktree within {self.worktree_acquire_timeout}s"
                )

            # Execute task using TaskExecutor
            executor = TaskExecutor(
                repo_path=str(worktree.path),
            )

            # Get task details
            async with async_session() as session:
                result = await session.execute(
                    select(TaskExecution).where(TaskExecution.id == task.id)
                )
                task_obj = result.scalar_one()

                # Extract task data from extra_data JSON field
                extra = task_obj.extra_data or {}
                implementation = extra.get("implementation", "")
                files = extra.get("files", [])
                verification_steps = extra.get("verification_steps", [])
                batch_number = extra.get("batch_number", 1)

                # Execute with timeout
                try:
                    exec_result = await asyncio.wait_for(
                        executor.execute_task(
                            task_number=task_obj.task_number,
                            task_title=task_obj.task_title,
                            implementation=implementation,
                            files=files,
                            verification_steps=verification_steps,
                            batch_number=batch_number,
                            auto_merge=False,  # Don't auto-merge, let review process handle it
                            worktree_path=worktree.path,
                            branch_name=task_obj.branch_name,
                            skip_github_ops=self.skip_github_ops,
                        ),
                        timeout=self.task_timeout_seconds
                    )

                    # Update task with results
                    if exec_result.success:
                        task_obj.status = TaskStatus.PR_CREATED.value
                        task_obj.pr_number = exec_result.pr_number
                        task_obj.pr_url = exec_result.pr_url
                        # Store commits in the commits JSON field
                        task_obj.commits = exec_result.commits
                    else:
                        task_obj.status = TaskStatus.FAILED.value
                        task_obj.error = exec_result.error or "Task execution failed"

                    task_obj.completed_at = datetime.now(timezone.utc)

                    await session.commit()
                    logger.info(f"[{self.worker_id}] Task {task.id} completed: {task_obj.status}")

                except asyncio.TimeoutError:
                    logger.error(f"[{self.worker_id}] Task {task.id} timed out after {self.task_timeout_seconds}s")
                    task_obj.status = TaskStatus.FAILED.value
                    task_obj.completed_at = datetime.now(timezone.utc)
                    task_obj.error = f"Task timed out after {self.task_timeout_seconds}s"
                    await session.commit()

        except Exception as e:
            logger.error(f"[{self.worker_id}] Error executing task {task.id}: {e}", exc_info=True)

            # Mark task as failed
            async with async_session() as session:
                result = await session.execute(
                    select(TaskExecution).where(TaskExecution.id == task.id)
                )
                task_obj = result.scalar_one()
                task_obj.status = TaskStatus.FAILED.value
                task_obj.completed_at = datetime.now(timezone.utc)
                task_obj.error = f"Worker error: {str(e)}"
                await session.commit()

        finally:
            # Always release worktree back to pool
            if worktree:
                await self.pool.release(worktree)
                logger.info(f"[{self.worker_id}] Released {worktree.id}")

            self.current_task = None

    async def stop(self):
        """Stop the worker gracefully."""
        logger.info(f"[{self.worker_id}] Stop requested")
        self.is_running = False
