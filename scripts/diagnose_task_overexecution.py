#!/usr/bin/env python3
"""
Diagnose task over-execution bug in parallel workers.

Instruments the task acquisition and execution flow to track:
1. Which tasks each worker acquires
2. Task status transitions
3. Duplicate task acquisitions
4. Database state at each step
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict

# Add backend to path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from sqlalchemy import select, update
from app.database import async_session, init_db
from app.models.autonomous import (
    AutonomousSession,
    BatchExecution,
    TaskExecution,
    TaskStatus,
    BatchStatus,
    SessionStatus,
)
from app.services.worktree_pool import WorktreePool


# Global tracking
acquisition_log = []
execution_log = []


async def setup_test_session(num_tasks: int = 4):
    """Create a test session with N pending tasks."""
    session_id = "diagnose-session"

    async with async_session() as session:
        # Clean up previous run (cascading delete handles batches and tasks)
        result = await session.execute(
            select(AutonomousSession).where(AutonomousSession.id == session_id)
        )
        old_session = result.scalar_one_or_none()
        if old_session:
            await session.delete(old_session)
        await session.commit()

        # Create new session
        test_session = AutonomousSession(
            id=session_id,
            plan_path="docs/plans/test.md",
            start_batch=1,
            end_batch=1,
            execution_mode="local",
            status=SessionStatus.EXECUTING.value,
            current_batch=1,
            tasks_total=num_tasks,
            tasks_completed=0,
        )
        session.add(test_session)

        # Create batch
        batch = BatchExecution(
            id=f"{session_id}-batch",
            session_id=session_id,
            plan_path="docs/plans/test.md",
            batch_number=1,
            status=BatchStatus.EXECUTING.value,
            started_at=datetime.now(timezone.utc),
        )
        session.add(batch)

        # Create tasks
        for i in range(1, num_tasks + 1):
            task = TaskExecution(
                id=f"task-{i}",
                batch_execution_id=f"{session_id}-batch",
                task_number=f"1.{i}",
                task_title=f"Test task {i}",
                branch_name=f"test/task-{i}",
                status=TaskStatus.PENDING.value,
                extra_data={},
            )
            session.add(task)

        await session.commit()
        print(f"✓ Created test session with {num_tasks} PENDING tasks")

        return session_id


async def get_task_statuses(session_id: str):
    """Get current status of all tasks."""
    async with async_session() as session:
        result = await session.execute(
            select(TaskExecution)
            .join(BatchExecution)
            .where(BatchExecution.session_id == session_id)
            .order_by(TaskExecution.task_number)
        )
        tasks = result.scalars().all()

        status_map = {}
        for task in tasks:
            status_map[task.id] = task.status

        return status_map


async def instrumented_get_next_task(session_id: str, worker_id: str):
    """
    Instrumented version of _get_next_pending_task using atomic update.
    """
    async with async_session() as session:
        # Phase 1: Find next pending task ID
        result = await session.execute(
            select(TaskExecution.id)
            .join(BatchExecution)
            .where(
                BatchExecution.session_id == session_id,
                TaskExecution.status == TaskStatus.PENDING.value
            )
            .order_by(BatchExecution.batch_number, TaskExecution.task_number)
            .limit(1)
        )
        task_id = result.scalar_one_or_none()

        if not task_id:
            return None

        # Phase 2: Atomically claim the task
        stmt = (
            update(TaskExecution)
            .where(
                TaskExecution.id == task_id,
                TaskExecution.status == TaskStatus.PENDING.value
            )
            .values(
                status=TaskStatus.IN_PROGRESS.value,
                started_at=datetime.now(timezone.utc)
            )
        )
        result = await session.execute(stmt)
        await session.commit()

        # Check if we actually claimed it
        if result.rowcount == 0:
            print(f"[{worker_id}] Task {task_id} was claimed by another worker (race lost)")
            return None

        # Log successful acquisition
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "worker_id": worker_id,
            "task_id": task_id,
            "action": "ACQUIRED",
        }
        acquisition_log.append(log_entry)
        print(f"[{worker_id}] ACQUIRED task {task_id} (atomically claimed)")

        return task_id


async def instrumented_complete_task(task_id: str, worker_id: str):
    """Instrumented task completion."""
    async with async_session() as session:
        result = await session.execute(
            select(TaskExecution).where(TaskExecution.id == task_id)
        )
        task = result.scalar_one()

        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "worker_id": worker_id,
            "task_id": task_id,
            "action": "COMPLETED",
            "status_before": task.status,
        }

        task.status = TaskStatus.PR_CREATED.value
        task.completed_at = datetime.now(timezone.utc)
        await session.commit()

        log_entry["status_after"] = TaskStatus.PR_CREATED.value
        execution_log.append(log_entry)
        print(f"[{worker_id}] COMPLETED {task_id} (marked as PR_CREATED)")


async def simulated_worker(worker_id: str, session_id: str, pool: WorktreePool):
    """Simulated worker with instrumentation."""
    tasks_executed = []

    while True:
        # Try to acquire next task
        task_id = await instrumented_get_next_task(session_id, worker_id)

        if task_id is None:
            print(f"[{worker_id}] No pending tasks found, exiting")
            break

        # Check for duplicate execution
        if task_id in tasks_executed:
            print(f"[{worker_id}] ⚠️  WARNING: Re-executing task {task_id}!")

        tasks_executed.append(task_id)

        # Acquire worktree
        try:
            worktree = await asyncio.wait_for(
                pool.acquire(test_name=task_id),
                timeout=10.0
            )
        except asyncio.TimeoutError:
            print(f"[{worker_id}] Timeout acquiring worktree for {task_id}")
            continue

        # Simulate work
        await asyncio.sleep(0.5)

        # Release worktree
        await pool.release(worktree)

        # Complete task
        await instrumented_complete_task(task_id, worker_id)

    print(f"[{worker_id}] Executed {len(tasks_executed)} tasks: {tasks_executed}")
    return tasks_executed


async def main():
    """Run diagnostic test."""
    print("="*70)
    print("TASK OVER-EXECUTION DIAGNOSTIC")
    print("="*70)

    # Initialize
    await init_db()
    num_tasks = 4
    num_workers = 3

    # Setup test session
    session_id = await setup_test_session(num_tasks)

    # Check initial state
    print("\nInitial task statuses:")
    statuses = await get_task_statuses(session_id)
    for task_id, status in statuses.items():
        print(f"  {task_id}: {status}")

    # Initialize pool
    pool = WorktreePool(pool_size=min(num_workers, 3), base_dir="../CC4-worktrees")
    await pool.initialize()
    print(f"\n✓ Initialized worktree pool with {pool.pool_size} worktrees")

    # Run workers
    print(f"\n{'='*70}")
    print(f"Running {num_workers} workers...")
    print(f"{'='*70}\n")

    workers = [
        simulated_worker(f"worker-{i}", session_id, pool)
        for i in range(1, num_workers + 1)
    ]

    results = await asyncio.gather(*workers)

    # Cleanup pool
    await pool.cleanup()

    # Analyze results
    print(f"\n{'='*70}")
    print("ANALYSIS")
    print(f"{'='*70}")

    all_executed_tasks = []
    for worker_tasks in results:
        all_executed_tasks.extend(worker_tasks)

    print(f"\nExpected: {num_tasks} tasks")
    print(f"Actual: {len(all_executed_tasks)} tasks executed")

    # Check for duplicates
    from collections import Counter
    task_counts = Counter(all_executed_tasks)
    duplicates = {task: count for task, count in task_counts.items() if count > 1}

    if duplicates:
        print(f"\n⚠️  DUPLICATES FOUND:")
        for task_id, count in duplicates.items():
            print(f"  {task_id}: executed {count} times")
    else:
        print(f"\n✓ No duplicate executions detected")

    # Final task statuses
    print("\nFinal task statuses:")
    final_statuses = await get_task_statuses(session_id)
    for task_id, status in final_statuses.items():
        print(f"  {task_id}: {status}")

    # Print acquisition log
    print(f"\n{'='*70}")
    print("ACQUISITION LOG")
    print(f"{'='*70}")
    for entry in acquisition_log:
        print(f"[{entry['timestamp']}] {entry['worker_id']} acquired {entry['task_id']}")

    # Verdict
    print(f"\n{'='*70}")
    if len(all_executed_tasks) == num_tasks and not duplicates:
        print("✅ PASS: Correct number of tasks executed, no duplicates")
    elif len(all_executed_tasks) > num_tasks:
        print(f"❌ FAIL: Over-execution detected ({len(all_executed_tasks)} > {num_tasks})")
        if duplicates:
            print("   Root cause: Tasks being acquired multiple times")
        else:
            print("   Root cause: Unknown (no duplicates but too many executions)")
    else:
        print(f"⚠️  Under-execution: {len(all_executed_tasks)} < {num_tasks}")
    print(f"{'='*70}")


if __name__ == "__main__":
    asyncio.run(main())
