#!/usr/bin/env python3
"""
Performance benchmark for parallel worker execution.

Tests parallel efficiency with 2-task and 4-task scenarios.
Target: 92-97% parallel efficiency (from PipelineHardening validation).
"""

import asyncio
import sys
import time
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict

# Add backend to path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
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
from app.services.autonomous_task_worker import AutonomousTaskWorker


class BenchmarkResult:
    """Results from a benchmark run."""

    def __init__(self, num_tasks: int, num_workers: int):
        self.num_tasks = num_tasks
        self.num_workers = num_workers
        self.start_time = None
        self.end_time = None
        self.duration_seconds = 0
        self.task_durations: List[float] = []
        self.sequential_time = 0
        self.parallel_efficiency = 0

    def calculate_efficiency(self):
        """Calculate parallel efficiency."""
        if not self.task_durations:
            return 0

        # Sequential time = sum of all task durations
        self.sequential_time = sum(self.task_durations)

        # Parallel efficiency = (sequential_time / (actual_time * num_workers)) * 100
        if self.duration_seconds > 0:
            self.parallel_efficiency = (
                self.sequential_time / (self.duration_seconds * self.num_workers)
            ) * 100

        return self.parallel_efficiency

    def __str__(self):
        return (
            f"\nBenchmark Results:\n"
            f"  Tasks: {self.num_tasks}\n"
            f"  Workers: {self.num_workers}\n"
            f"  Total Duration: {self.duration_seconds:.2f}s\n"
            f"  Sequential Time: {self.sequential_time:.2f}s\n"
            f"  Parallel Efficiency: {self.parallel_efficiency:.1f}%\n"
            f"  Average Task Duration: {sum(self.task_durations)/len(self.task_durations):.2f}s\n"
        )


async def cleanup_previous_runs():
    """Clean up any previous benchmark data."""
    async with async_session() as session:
        result = await session.execute(
            select(AutonomousSession).where(
                AutonomousSession.id.like("benchmark-%")
            )
        )
        sessions = result.scalars().all()
        for s in sessions:
            await session.delete(s)
        await session.commit()
        if sessions:
            print(f"✓ Cleaned up {len(sessions)} previous benchmark sessions")


async def create_benchmark_session(
    session_id: str,
    num_tasks: int,
) -> None:
    """Create a benchmark session with simple test tasks."""
    print(f"\n=== Creating Benchmark Session: {session_id} ({num_tasks} tasks) ===")

    async with async_session() as session:
        # Create session
        test_session = AutonomousSession(
            id=session_id,
            plan_path="docs/plans/benchmark.md",
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
            id=f"{session_id}-batch-1",
            session_id=session_id,
            plan_path="docs/plans/benchmark.md",
            batch_number=1,
            status=BatchStatus.EXECUTING.value,
            started_at=datetime.now(timezone.utc),
        )
        session.add(batch)

        # Create simple test tasks
        # Each task will create a small test file (fast execution)
        for i in range(1, num_tasks + 1):
            task = TaskExecution(
                id=f"{session_id}-task-{i}",
                batch_execution_id=f"{session_id}-batch-1",
                task_number=f"1.{i}",
                task_title=f"Benchmark task {i}",
                branch_name=f"benchmark/task-{i}",
                status=TaskStatus.PENDING.value,
                extra_data={
                    "implementation": f"Create a test file benchmark_{i}.txt with some content",
                    "files": [f"benchmark_{i}.txt"],
                    "verification_steps": [f"ls benchmark_{i}.txt"],
                    "batch_number": 1,
                },
            )
            session.add(task)

        await session.commit()
        print(f"✓ Created session with {num_tasks} tasks")


async def run_workers(
    session_id: str,
    num_workers: int,
    pool: WorktreePool,
) -> None:
    """Start workers and wait for them to complete all tasks."""
    print(f"\n=== Starting {num_workers} Workers ===")

    # Create workers
    workers = [
        AutonomousTaskWorker(
            worker_id=f"benchmark-worker-{i}",
            execution_id=session_id,
            pool=pool,
            task_timeout_seconds=300.0,  # 5 min per task
            worktree_acquire_timeout=60.0,  # 1 min to acquire
            skip_github_ops=True,  # Skip GitHub operations for benchmarking
        )
        for i in range(1, num_workers + 1)
    ]

    # Run all workers concurrently
    worker_tasks = [asyncio.create_task(worker.run()) for worker in workers]

    # Wait for all workers to complete
    await asyncio.gather(*worker_tasks)

    print(f"✓ All workers completed")


async def get_task_durations(session_id: str) -> List[float]:
    """Get duration of each completed task."""
    async with async_session() as session:
        result = await session.execute(
            select(TaskExecution).where(
                TaskExecution.id.like(f"{session_id}-%")
            )
        )
        tasks = result.scalars().all()

        durations = []
        for task in tasks:
            if task.started_at and task.completed_at:
                duration = (task.completed_at - task.started_at).total_seconds()
                durations.append(duration)

        return durations


async def check_all_tasks_completed(session_id: str) -> tuple[int, int, int]:
    """Check task completion status."""
    async with async_session() as session:
        result = await session.execute(
            select(TaskExecution).where(
                TaskExecution.id.like(f"{session_id}-%")
            )
        )
        tasks = result.scalars().all()

        completed = sum(1 for t in tasks if t.status in [TaskStatus.PR_CREATED.value, TaskStatus.MERGED.value])
        failed = sum(1 for t in tasks if t.status == TaskStatus.FAILED.value)
        total = len(tasks)

        return completed, failed, total


async def wait_for_completion(session_id: str, timeout_seconds: float = 600.0):
    """Wait for all tasks to complete or timeout."""
    start = time.time()

    while time.time() - start < timeout_seconds:
        completed, failed, total = await check_all_tasks_completed(session_id)

        if completed + failed >= total:
            print(f"✓ All tasks finished: {completed} completed, {failed} failed")
            return True

        print(f"  Progress: {completed + failed}/{total} tasks finished...")
        await asyncio.sleep(2)

    print(f"✗ Timeout after {timeout_seconds}s")
    return False


async def run_benchmark(
    num_tasks: int,
    num_workers: int,
    pool: WorktreePool,
) -> BenchmarkResult:
    """Run a single benchmark scenario."""
    session_id = f"benchmark-{num_tasks}t-{num_workers}w-{int(time.time())}"
    result = BenchmarkResult(num_tasks, num_workers)

    print("\n" + "=" * 70)
    print(f"BENCHMARK: {num_tasks} tasks, {num_workers} workers")
    print("=" * 70)

    # Create test session
    await create_benchmark_session(session_id, num_tasks)

    # Start timer
    result.start_time = time.time()

    # Run workers
    await run_workers(session_id, num_workers, pool)

    # Wait for completion
    success = await wait_for_completion(session_id, timeout_seconds=600.0)

    # End timer
    result.end_time = time.time()
    result.duration_seconds = result.end_time - result.start_time

    if success:
        # Get task durations
        result.task_durations = await get_task_durations(session_id)
        result.calculate_efficiency()

        print(result)

        # Check completion status
        completed, failed, total = await check_all_tasks_completed(session_id)
        if failed > 0:
            print(f"⚠️  Warning: {failed}/{total} tasks failed")
    else:
        print("✗ Benchmark failed - timeout")

    return result


async def main():
    """Run parallel worker benchmarks."""
    print("=" * 70)
    print("PARALLEL WORKER PERFORMANCE BENCHMARKS")
    print("=" * 70)
    print("\nTarget: 92-97% parallel efficiency (PipelineHardening baseline)")
    print("=" * 70)

    # Initialize database
    await init_db()

    # Clean up previous runs
    await cleanup_previous_runs()

    # Initialize worktree pool (3 workers max)
    print("\n=== Initializing Worktree Pool ===")
    pool = WorktreePool(
        pool_size=3,
        base_dir="../CC4-worktrees",
    )

    try:
        await pool.initialize()
        print(f"✓ Worktree pool initialized: {pool.pool_size} worktrees")

        # Run benchmarks
        results = []

        # Benchmark 1: 2 tasks, 2 workers
        print("\n\n🔥 BENCHMARK 1: 2 Tasks, 2 Workers")
        result1 = await run_benchmark(2, 2, pool)
        results.append(result1)

        await asyncio.sleep(5)  # Brief pause between benchmarks

        # Benchmark 2: 4 tasks, 3 workers
        print("\n\n🔥 BENCHMARK 2: 4 Tasks, 3 Workers")
        result2 = await run_benchmark(4, 3, pool)
        results.append(result2)

        # Print summary
        print("\n" + "=" * 70)
        print("BENCHMARK SUMMARY")
        print("=" * 70)

        for i, result in enumerate(results, 1):
            print(f"\nBenchmark {i}:")
            print(f"  Scenario: {result.num_tasks} tasks, {result.num_workers} workers")
            print(f"  Duration: {result.duration_seconds:.2f}s")
            print(f"  Parallel Efficiency: {result.parallel_efficiency:.1f}%")

            # Compare to target
            if 92 <= result.parallel_efficiency <= 97:
                status = "✓ PASS (within target range)"
            elif result.parallel_efficiency >= 85:
                status = "⚠️  ACCEPTABLE (slightly below target)"
            else:
                status = "✗ FAIL (below acceptable range)"

            print(f"  Status: {status}")

        # Overall assessment
        print("\n" + "=" * 70)
        avg_efficiency = sum(r.parallel_efficiency for r in results) / len(results)
        print(f"Average Efficiency: {avg_efficiency:.1f}%")

        if 92 <= avg_efficiency <= 97:
            print("✅ OVERALL: EXCELLENT - Matches PipelineHardening performance")
        elif avg_efficiency >= 85:
            print("⚠️  OVERALL: GOOD - Acceptable performance")
        else:
            print("❌ OVERALL: NEEDS IMPROVEMENT")

        print("=" * 70)

    finally:
        # Cleanup pool
        print("\n=== Cleaning Up Worktree Pool ===")
        await pool.cleanup()
        print("✓ Cleanup complete")


if __name__ == "__main__":
    asyncio.run(main())
