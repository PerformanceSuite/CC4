#!/usr/bin/env python3
"""
Profile coordination overhead in parallel workers.

Measures time spent in different operations:
- Database task acquisition
- Worktree pool operations
- Task status updates
- Overall coordination vs execution
"""

import asyncio
import sys
import time
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict
from collections import defaultdict
import statistics

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


# Profiling data
profile_data = defaultdict(list)


class Timer:
    """Context manager for timing operations."""
    def __init__(self, operation: str, worker_id: str = None):
        self.operation = operation
        self.worker_id = worker_id
        self.start_time = None

    def __enter__(self):
        self.start_time = time.perf_counter()
        return self

    def __exit__(self, *args):
        elapsed_ms = (time.perf_counter() - self.start_time) * 1000
        key = f"{self.worker_id}:{self.operation}" if self.worker_id else self.operation
        profile_data[self.operation].append(elapsed_ms)


async def setup_test_session(num_tasks: int = 6):
    """Create a test session with N pending tasks."""
    session_id = "profile-session"

    async with async_session() as session:
        # Clean up previous run
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


async def profile_get_next_task(session_id: str, worker_id: str):
    """
    Profiled version of _get_next_pending_task.
    """
    with Timer("total_acquisition", worker_id):
        async with async_session() as session:
            # Phase 1: Find task ID
            with Timer("db_select_task_id", worker_id):
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

            # Phase 2: Atomic claim
            with Timer("db_update_claim", worker_id):
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

            with Timer("db_commit_claim", worker_id):
                await session.commit()

            if result.rowcount == 0:
                return None

            # Phase 3: Fetch task details
            with Timer("db_fetch_task", worker_id):
                result = await session.execute(
                    select(TaskExecution).where(TaskExecution.id == task_id)
                )
                task = result.scalar_one()

            return task_id


async def profile_complete_task(task_id: str, worker_id: str):
    """Profiled task completion."""
    with Timer("total_completion", worker_id):
        async with async_session() as session:
            with Timer("db_update_complete", worker_id):
                stmt = (
                    update(TaskExecution)
                    .where(TaskExecution.id == task_id)
                    .values(
                        status=TaskStatus.PR_CREATED.value,
                        completed_at=datetime.now(timezone.utc)
                    )
                )
                await session.execute(stmt)

            with Timer("db_commit_complete", worker_id):
                await session.commit()


async def profiled_worker(
    worker_id: str,
    session_id: str,
    pool: WorktreePool,
    task_duration_ms: int
):
    """Worker with full profiling instrumentation."""
    tasks_executed = []

    while True:
        # Get next task
        task_id = await profile_get_next_task(session_id, worker_id)

        if task_id is None:
            break

        tasks_executed.append(task_id)

        # Acquire worktree
        with Timer("worktree_acquire", worker_id):
            try:
                worktree = await asyncio.wait_for(
                    pool.acquire(test_name=task_id),
                    timeout=10.0
                )
            except asyncio.TimeoutError:
                continue

        # Simulate work
        with Timer("task_execution", worker_id):
            await asyncio.sleep(task_duration_ms / 1000.0)

        # Release worktree
        with Timer("worktree_release", worker_id):
            await pool.release(worktree)

        # Complete task
        await profile_complete_task(task_id, worker_id)

    return len(tasks_executed)


async def main():
    """Run profiling benchmark."""
    print("="*70)
    print("PARALLEL WORKER OVERHEAD PROFILING")
    print("="*70)

    # Initialize
    await init_db()
    num_tasks = 6
    num_workers = 3
    task_duration_ms = 500

    # Setup
    session_id = await setup_test_session(num_tasks)

    # Initialize pool
    pool = WorktreePool(pool_size=min(num_workers, 3), base_dir="../CC4-worktrees")
    await pool.initialize()
    print(f"✓ Initialized worktree pool with {pool.pool_size} worktrees\n")

    # Run workers
    print(f"Running {num_workers} workers with {task_duration_ms}ms task duration...\n")
    start_time = time.time()

    workers = [
        profiled_worker(f"worker-{i}", session_id, pool, task_duration_ms)
        for i in range(1, num_workers + 1)
    ]

    results = await asyncio.gather(*workers)
    end_time = time.time()

    # Cleanup
    await pool.cleanup()

    # Analyze results
    total_duration = (end_time - start_time) * 1000  # ms
    total_tasks = sum(results)

    print("="*70)
    print("PROFILING RESULTS")
    print("="*70)

    print(f"\nOverall:")
    print(f"  Total duration: {total_duration:.1f}ms")
    print(f"  Tasks completed: {total_tasks}")
    print(f"  Average time per task: {total_duration / total_tasks:.1f}ms")

    # Calculate overhead breakdown
    operations = [
        "db_select_task_id",
        "db_update_claim",
        "db_commit_claim",
        "db_fetch_task",
        "total_acquisition",
        "worktree_acquire",
        "worktree_release",
        "task_execution",
        "db_update_complete",
        "db_commit_complete",
        "total_completion",
    ]

    print(f"\nOperation Breakdown (average times):")
    print(f"{'Operation':<30} {'Avg (ms)':<12} {'Count':<8} {'Total (ms)':<12} {'% of Total':<10}")
    print("-" * 70)

    # Calculate totals
    operation_totals = {}
    for op in operations:
        if op in profile_data:
            data = profile_data[op]
            avg = statistics.mean(data)
            count = len(data)
            total = sum(data)
            pct = (total / total_duration) * 100
            operation_totals[op] = total
            print(f"{op:<30} {avg:>10.2f}   {count:>6}   {total:>10.1f}   {pct:>8.1f}%")

    # Calculate coordination overhead
    print(f"\n{'='*70}")
    print("COORDINATION OVERHEAD ANALYSIS")
    print(f"{'='*70}")

    # Total time in database operations
    db_ops = ["db_select_task_id", "db_update_claim", "db_commit_claim",
              "db_fetch_task", "db_update_complete", "db_commit_complete"]
    db_total = sum(operation_totals.get(op, 0) for op in db_ops)
    db_pct = (db_total / total_duration) * 100

    # Total time in worktree operations
    wt_ops = ["worktree_acquire", "worktree_release"]
    wt_total = sum(operation_totals.get(op, 0) for op in wt_ops)
    wt_pct = (wt_total / total_duration) * 100

    # Actual execution time
    exec_total = operation_totals.get("task_execution", 0)
    exec_pct = (exec_total / total_duration) * 100

    # Overhead (everything else)
    overhead_total = total_duration - exec_total
    overhead_pct = (overhead_total / total_duration) * 100

    print(f"\nTime Distribution:")
    print(f"  Database operations:  {db_total:>8.1f}ms ({db_pct:>5.1f}%)")
    print(f"  Worktree operations:  {wt_total:>8.1f}ms ({wt_pct:>5.1f}%)")
    print(f"  Task execution:       {exec_total:>8.1f}ms ({exec_pct:>5.1f}%)")
    print(f"  Other overhead:       {overhead_total - db_total - wt_total:>8.1f}ms")
    print(f"  ---")
    print(f"  Total overhead:       {overhead_total:>8.1f}ms ({overhead_pct:>5.1f}%)")
    print(f"  Useful work:          {exec_total:>8.1f}ms ({exec_pct:>5.1f}%)")

    # Calculate theoretical vs actual
    sequential_time = num_tasks * task_duration_ms
    theoretical_parallel = sequential_time / num_workers
    speedup = sequential_time / total_duration
    efficiency = (speedup / num_workers) * 100

    print(f"\nEfficiency Analysis:")
    print(f"  Sequential time:      {sequential_time:.0f}ms")
    print(f"  Theoretical parallel: {theoretical_parallel:.0f}ms")
    print(f"  Actual parallel:      {total_duration:.0f}ms")
    print(f"  Speedup:              {speedup:.2f}x")
    print(f"  Parallel efficiency:  {efficiency:.1f}%")
    print(f"  Target efficiency:    92-97%")
    print(f"  Gap:                  {efficiency - 92:.1f} to {efficiency - 97:.1f} percentage points")

    # Recommendations
    print(f"\n{'='*70}")
    print("OPTIMIZATION RECOMMENDATIONS")
    print(f"{'='*70}")

    if db_pct > 20:
        print(f"\n⚠️  Database overhead is high ({db_pct:.1f}%)")
        print("  → Consider testing with PostgreSQL (better concurrent performance)")
        print("  → Or optimize queries (reduce round-trips)")

    if wt_pct > 10:
        print(f"\n⚠️  Worktree overhead is high ({wt_pct:.1f}%)")
        print("  → Profile worktree acquisition/release in detail")
        print("  → Consider caching or pooling optimizations")

    if efficiency < 85:
        print(f"\n⚠️  Efficiency is below target ({efficiency:.1f}% vs 92-97%)")
        print("  → Primary bottleneck appears to be coordination overhead")
        print("  → SQLite database-level locking may be limiting parallelism")

    print(f"\n{'='*70}")


if __name__ == "__main__":
    asyncio.run(main())
