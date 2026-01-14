#!/usr/bin/env python3
"""
Lightweight benchmark for parallel worker coordination.

Tests task acquisition, locking, and worker pool efficiency without
requiring actual task execution (no Claude CLI, no PRs).

Focus: Worker coordination overhead and parallel efficiency
"""

import asyncio
import sys
import time
from pathlib import Path
from datetime import datetime, timezone
from typing import List

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


async def cleanup_previous_runs():
    """Clean up any previous benchmark data."""
    async with async_session() as session:
        result = await session.execute(
            select(AutonomousSession).where(
                AutonomousSession.id.like("coord-bench-%")
            )
        )
        sessions = result.scalars().all()
        for s in sessions:
            await session.delete(s)
        await session.commit()
        if sessions:
            print(f"✓ Cleaned up {len(sessions)} previous sessions")


async def create_test_session(session_id: str, num_tasks: int):
    """Create test session with pending tasks."""
    async with async_session() as session:
        # Create session
        test_session = AutonomousSession(
            id=session_id,
            plan_path="docs/plans/coord-benchmark.md",
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
            plan_path="docs/plans/coord-benchmark.md",
            batch_number=1,
            status=BatchStatus.EXECUTING.value,
            started_at=datetime.now(timezone.utc),
        )
        session.add(batch)

        # Create tasks
        for i in range(1, num_tasks + 1):
            task = TaskExecution(
                id=f"{session_id}-task-{i}",
                batch_execution_id=f"{session_id}-batch",
                task_number=f"1.{i}",
                task_title=f"Coordination test task {i}",
                branch_name=f"coord/task-{i}",
                status=TaskStatus.PENDING.value,
                extra_data={},
            )
            session.add(task)

        await session.commit()


async def simulate_worker(
    worker_id: str,
    session_id: str,
    pool: WorktreePool,
    task_duration_ms: int,
    stats: dict,
):
    """
    Simulate a worker that:
    1. Acquires tasks from queue (with locking)
    2. Acquires worktree from pool
    3. Simulates work (sleep)
    4. Releases worktree
    5. Updates task status
    """
    tasks_completed = 0
    worktree_wait_times = []
    task_exec_times = []

    while True:
        # Try to get next pending task
        async with async_session() as session:
            result = await session.execute(
                select(TaskExecution)
                .join(BatchExecution)
                .where(
                    BatchExecution.session_id == session_id,
                    TaskExecution.status == TaskStatus.PENDING.value
                )
                .order_by(BatchExecution.batch_number, TaskExecution.task_number)
                .limit(1)
                .with_for_update(skip_locked=True)
            )
            task = result.scalar_one_or_none()

            if task is None:
                # No more pending tasks
                break

            # Mark as in progress
            task.status = TaskStatus.IN_PROGRESS.value
            task.started_at = datetime.now(timezone.utc)
            await session.commit()
            task_id = task.id

        # Acquire worktree
        wt_start = time.time()
        try:
            worktree = await asyncio.wait_for(
                pool.acquire(test_name=task_id),
                timeout=30.0
            )
            wt_wait = (time.time() - wt_start) * 1000  # ms
            worktree_wait_times.append(wt_wait)
        except asyncio.TimeoutError:
            print(f"[{worker_id}] Timeout acquiring worktree")
            continue

        # Simulate task execution
        exec_start = time.time()
        await asyncio.sleep(task_duration_ms / 1000.0)
        exec_time = (time.time() - exec_start) * 1000  # ms
        task_exec_times.append(exec_time)

        # Release worktree
        await pool.release(worktree)

        # Mark task as completed
        async with async_session() as session:
            result = await session.execute(
                select(TaskExecution).where(TaskExecution.id == task_id)
            )
            task_obj = result.scalar_one()
            task_obj.status = TaskStatus.PR_CREATED.value
            task_obj.completed_at = datetime.now(timezone.utc)
            await session.commit()

        tasks_completed += 1

    # Record stats
    stats[worker_id] = {
        "tasks_completed": tasks_completed,
        "avg_worktree_wait_ms": sum(worktree_wait_times) / len(worktree_wait_times) if worktree_wait_times else 0,
        "avg_task_exec_ms": sum(task_exec_times) / len(task_exec_times) if task_exec_times else 0,
    }


async def run_benchmark(num_tasks: int, num_workers: int, task_duration_ms: int):
    """Run coordination benchmark."""
    session_id = f"coord-bench-{num_tasks}t-{num_workers}w"

    print(f"\n{'='*70}")
    print(f"BENCHMARK: {num_tasks} tasks × {num_workers} workers")
    print(f"Task duration: {task_duration_ms}ms (simulated)")
    print(f"{'='*70}")

    # Create test session
    await create_test_session(session_id, num_tasks)
    print(f"✓ Created {num_tasks} pending tasks")

    # Initialize pool
    pool = WorktreePool(
        pool_size=min(num_workers, 3),  # Max 3 worktrees
        base_dir="../CC4-worktrees",
    )
    await pool.initialize()
    print(f"✓ Initialized worktree pool: {pool.pool_size} worktrees")

    # Run workers
    stats = {}
    start_time = time.time()

    workers = [
        simulate_worker(
            f"worker-{i}",
            session_id,
            pool,
            task_duration_ms,
            stats
        )
        for i in range(1, num_workers + 1)
    ]

    await asyncio.gather(*workers)

    end_time = time.time()
    duration_s = end_time - start_time

    # Cleanup pool
    await pool.cleanup()

    # Calculate metrics
    sequential_time_s = (num_tasks * task_duration_ms) / 1000.0
    speedup = sequential_time_s / duration_s
    efficiency = (speedup / num_workers) * 100

    # Print results
    print(f"\n{'='*70}")
    print(f"RESULTS")
    print(f"{'='*70}")
    print(f"\nTiming:")
    print(f"  Actual Duration: {duration_s:.2f}s")
    print(f"  Sequential Time: {sequential_time_s:.2f}s (if run on 1 worker)")
    print(f"  Speedup: {speedup:.2f}x")
    print(f"  Parallel Efficiency: {efficiency:.1f}%")

    print(f"\nWorker Stats:")
    for worker_id, worker_stats in sorted(stats.items()):
        print(f"  {worker_id}:")
        print(f"    Tasks: {worker_stats['tasks_completed']}")
        print(f"    Avg Worktree Wait: {worker_stats['avg_worktree_wait_ms']:.1f}ms")
        print(f"    Avg Exec Time: {worker_stats['avg_task_exec_ms']:.1f}ms")

    # Check completion
    async with async_session() as session:
        result = await session.execute(
            select(TaskExecution).where(
                TaskExecution.id.like(f"{session_id}-%")
            )
        )
        tasks = result.scalars().all()
        completed = sum(1 for t in tasks if t.status == TaskStatus.PR_CREATED.value)
        print(f"\nCompletion: {completed}/{num_tasks} tasks")

    # Verdict
    print(f"\n{'='*70}")
    if 92 <= efficiency <= 100:
        print("✅ EXCELLENT - Matches PipelineHardening baseline (92-97%)")
    elif 85 <= efficiency < 92:
        print("⚠️  GOOD - Acceptable performance")
    elif 70 <= efficiency < 85:
        print("⚠️  FAIR - Room for improvement")
    else:
        print("❌ POOR - Significant overhead detected")
    print(f"{'='*70}\n")

    return efficiency


async def main():
    """Run coordination benchmarks."""
    print("="*70)
    print("PARALLEL WORKER COORDINATION BENCHMARK")
    print("="*70)
    print("\nTests worker task acquisition, locking, and pool coordination")
    print("without actual task execution overhead.\n")
    print("Target: 92-97% parallel efficiency")
    print("="*70)

    # Initialize database
    await init_db()
    await cleanup_previous_runs()

    # Run benchmarks
    results = []

    # Benchmark 1: 2 tasks, 2 workers, 1000ms per task
    print("\n🔥 TEST 1: Light load (2 tasks, 2 workers)")
    eff1 = await run_benchmark(2, 2, 1000)
    results.append(("2 tasks, 2 workers", eff1))

    await asyncio.sleep(2)

    # Benchmark 2: 4 tasks, 3 workers, 1000ms per task
    print("\n🔥 TEST 2: Medium load (4 tasks, 3 workers)")
    eff2 = await run_benchmark(4, 3, 1000)
    results.append(("4 tasks, 3 workers", eff2))

    await asyncio.sleep(2)

    # Benchmark 3: 6 tasks, 3 workers, 500ms per task
    print("\n🔥 TEST 3: Higher load (6 tasks, 3 workers, fast tasks)")
    eff3 = await run_benchmark(6, 3, 500)
    results.append(("6 tasks, 3 workers", eff3))

    # Summary
    print("\n" + "="*70)
    print("FINAL SUMMARY")
    print("="*70)

    for scenario, efficiency in results:
        status = "✓" if efficiency >= 92 else "⚠️" if efficiency >= 85 else "✗"
        print(f"{status} {scenario}: {efficiency:.1f}%")

    avg_efficiency = sum(e for _, e in results) / len(results)
    print(f"\nAverage Efficiency: {avg_efficiency:.1f}%")

    if avg_efficiency >= 92:
        print("\n✅ OVERALL VERDICT: EXCELLENT")
        print("Worker coordination is highly efficient. Ready for production.")
    elif avg_efficiency >= 85:
        print("\n⚠️  OVERALL VERDICT: GOOD")
        print("Worker coordination is acceptable with minor overhead.")
    else:
        print("\n❌ OVERALL VERDICT: NEEDS IMPROVEMENT")
        print("Significant coordination overhead detected.")

    print("="*70)


if __name__ == "__main__":
    asyncio.run(main())
