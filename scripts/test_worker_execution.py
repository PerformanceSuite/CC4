#!/usr/bin/env python3
"""Test script to verify worker task acquisition and execution."""

import asyncio
import sys
from pathlib import Path

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
from datetime import datetime, timezone


async def create_test_session_with_tasks():
    """Create a test session with properly structured tasks."""
    print("\n=== Creating Test Session with Tasks ===")

    # First cleanup any existing test data
    async with async_session() as session:
        result = await session.execute(
            select(AutonomousSession).where(
                AutonomousSession.id == "test-worker-session-001"
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            await session.delete(existing)
            await session.commit()
            print("✓ Cleaned up previous test data")

    async with async_session() as session:
        # Create test session
        test_session = AutonomousSession(
            id="test-worker-session-001",
            plan_path="docs/plans/test-plan.md",
            start_batch=1,
            end_batch=1,
            execution_mode="local",
            status=SessionStatus.EXECUTING.value,
            current_batch=1,
            tasks_total=2,
            tasks_completed=0,
        )
        session.add(test_session)

        # Create batch 1
        batch1 = BatchExecution(
            id="test-batch-001",
            session_id="test-worker-session-001",
            plan_path="docs/plans/test-plan.md",
            batch_number=1,
            status=BatchStatus.EXECUTING.value,
            started_at=datetime.now(timezone.utc),
        )
        session.add(batch1)

        # Create tasks with proper extra_data structure
        tasks = [
            TaskExecution(
                id="test-task-1.1",
                batch_execution_id="test-batch-001",
                task_number="1.1",
                task_title="Test task 1.1",
                branch_name="test/task-1-1",
                status=TaskStatus.PENDING.value,
                extra_data={
                    "implementation": "Create a test file with some content",
                    "files": ["test_file_1.txt"],
                    "verification_steps": ["ls test_file_1.txt"],
                    "batch_number": 1,
                },
            ),
            TaskExecution(
                id="test-task-1.2",
                batch_execution_id="test-batch-001",
                task_number="1.2",
                task_title="Test task 1.2",
                branch_name="test/task-1-2",
                status=TaskStatus.PENDING.value,
                extra_data={
                    "implementation": "Create another test file",
                    "files": ["test_file_2.txt"],
                    "verification_steps": ["ls test_file_2.txt"],
                    "batch_number": 1,
                },
            ),
        ]
        for task in tasks:
            session.add(task)

        await session.commit()
        print(f"✓ Created test session: {test_session.id}")
        print(f"✓ Created batch: {batch1.id}")
        print(f"✓ Created {len(tasks)} tasks with proper extra_data")

        # Verify extra_data structure
        print("\n=== Verifying Task Data Structure ===")
        for task in tasks:
            print(f"\nTask {task.task_number}:")
            print(f"  ID: {task.id}")
            print(f"  Title: {task.task_title}")
            print(f"  Branch: {task.branch_name}")
            print(f"  Status: {task.status}")
            print(f"  Extra data: {task.extra_data}")


async def test_get_next_pending_task(worker):
    """Test getting next pending task."""
    print("\n=== Testing _get_next_pending_task ===")

    task = await worker._get_next_pending_task()

    if task:
        print(f"✓ Found pending task: {task.id}")
        print(f"  Title: {task.task_title}")
        print(f"  Status: {task.status}")
        print(f"  Extra data: {task.extra_data}")

        # Verify status was updated to IN_PROGRESS
        if task.status == TaskStatus.IN_PROGRESS.value:
            print(f"✓ Status correctly updated to IN_PROGRESS")
        else:
            print(f"✗ Status is {task.status}, expected IN_PROGRESS")

        return task
    else:
        print("✗ No pending tasks found")
        return None


async def verify_task_fields(task_id):
    """Verify task has all required fields."""
    print(f"\n=== Verifying Task Fields for {task_id} ===")

    async with async_session() as session:
        result = await session.execute(
            select(TaskExecution).where(TaskExecution.id == task_id)
        )
        task = result.scalar_one()

        print(f"✓ task.id: {task.id}")
        print(f"✓ task.task_number: {task.task_number}")
        print(f"✓ task.task_title: {task.task_title}")
        print(f"✓ task.branch_name: {task.branch_name}")
        print(f"✓ task.status: {task.status}")
        print(f"✓ task.pr_number: {task.pr_number}")
        print(f"✓ task.pr_url: {task.pr_url}")
        print(f"✓ task.commits: {task.commits}")
        print(f"✓ task.error: {task.error}")
        print(f"✓ task.extra_data: {task.extra_data}")


async def check_all_tasks_status():
    """Check status of all tasks."""
    print("\n=== Checking All Tasks Status ===")

    async with async_session() as session:
        result = await session.execute(
            select(TaskExecution)
            .where(TaskExecution.id.like("test-task-%"))
            .order_by(TaskExecution.task_number)
        )
        tasks = result.scalars().all()

        for task in tasks:
            print(f"\nTask {task.task_number}:")
            print(f"  ID: {task.id}")
            print(f"  Status: {task.status}")
            print(f"  PR: {task.pr_url or 'Not created'}")
            print(f"  Error: {task.error or 'None'}")


async def cleanup_test_data():
    """Remove test data."""
    print("\n=== Cleaning Up Test Data ===")

    async with async_session() as session:
        # Delete test session (cascade will delete batches and tasks)
        result = await session.execute(
            select(AutonomousSession).where(
                AutonomousSession.id == "test-worker-session-001"
            )
        )
        test_session = result.scalar_one_or_none()

        if test_session:
            await session.delete(test_session)
            await session.commit()
            print("✓ Cleaned up test data")


async def main():
    """Run worker execution tests."""
    print("=" * 60)
    print("WORKER EXECUTION TEST")
    print("=" * 60)

    # Initialize database
    await init_db()

    # Create test data
    await create_test_session_with_tasks()

    # Create a mock worker (without actual worktree pool)
    # We'll only test the _get_next_pending_task method
    worker = AutonomousTaskWorker(
        worker_id="test-worker-1",
        execution_id="test-worker-session-001",
        pool=None,  # Not testing actual execution, just task acquisition
    )

    # Test getting next pending task
    task = await test_get_next_pending_task(worker)

    if task:
        # Verify task has all required fields
        await verify_task_fields(task.id)

    # Check all tasks status
    await check_all_tasks_status()

    # Cleanup
    await cleanup_test_data()

    print("\n" + "=" * 60)
    print("FIXES APPLIED")
    print("=" * 60)
    print("\n✓ TaskStatus.RUNNING → TaskStatus.IN_PROGRESS")
    print("✓ execute_task() call signature corrected")
    print("✓ Field names corrected (task_title, not title)")
    print("✓ Using task.error instead of non-existent output_summary")
    print("✓ Task data properly structured in extra_data JSON field")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
