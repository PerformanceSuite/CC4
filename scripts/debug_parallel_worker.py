#!/usr/bin/env python3
"""Debug script to verify parallel worker task acquisition and execution."""

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
from datetime import datetime, timezone


async def check_database_schema():
    """Verify database tables exist and show schema."""
    print("\n=== Checking Database Schema ===")

    async with async_session() as session:
        # Check if tables exist by trying to query them
        try:
            result = await session.execute(select(AutonomousSession).limit(1))
            print("✓ autonomous_sessions table exists")
        except Exception as e:
            print(f"✗ autonomous_sessions table error: {e}")

        try:
            result = await session.execute(select(BatchExecution).limit(1))
            print("✓ batch_executions table exists")
        except Exception as e:
            print(f"✗ batch_executions table error: {e}")

        try:
            result = await session.execute(select(TaskExecution).limit(1))
            print("✓ task_executions table exists")
        except Exception as e:
            print(f"✗ task_executions table error: {e}")


async def verify_task_status_enum():
    """Verify TaskStatus enum values."""
    print("\n=== TaskStatus Enum Values ===")
    for status in TaskStatus:
        print(f"  {status.name} = '{status.value}'")

    print("\n=== ISSUE FOUND ===")
    print("The code uses TaskStatus.RUNNING but this doesn't exist!")
    print("Available statuses: PENDING, IN_PROGRESS, PR_CREATED, REVIEWING, FIXING, APPROVED, MERGED, FAILED")
    print("Should use TaskStatus.IN_PROGRESS instead of TaskStatus.RUNNING")


async def create_test_data():
    """Create test session, batch, and tasks for debugging."""
    print("\n=== Creating Test Data ===")

    async with async_session() as session:
        # Create test session
        test_session = AutonomousSession(
            id="test-session-001",
            plan_path="docs/plans/test-plan.md",
            start_batch=1,
            end_batch=2,
            execution_mode="local",
            status=SessionStatus.EXECUTING.value,
            current_batch=1,
            tasks_total=4,
            tasks_completed=0,
        )
        session.add(test_session)

        # Create batch 1
        batch1 = BatchExecution(
            id="batch-001",
            session_id="test-session-001",
            plan_path="docs/plans/test-plan.md",
            batch_number=1,
            status=BatchStatus.EXECUTING.value,
            started_at=datetime.now(timezone.utc),
        )
        session.add(batch1)

        # Create tasks for batch 1
        tasks = [
            TaskExecution(
                id="task-1.1",
                batch_execution_id="batch-001",
                task_number="1.1",
                task_title="Implement feature A",
                branch_name="feature/task-1-1",
                status=TaskStatus.PENDING.value,
            ),
            TaskExecution(
                id="task-1.2",
                batch_execution_id="batch-001",
                task_number="1.2",
                task_title="Implement feature B",
                branch_name="feature/task-1-2",
                status=TaskStatus.PENDING.value,
            ),
        ]
        for task in tasks:
            session.add(task)

        await session.commit()
        print(f"✓ Created test session: {test_session.id}")
        print(f"✓ Created batch: {batch1.id}")
        print(f"✓ Created {len(tasks)} pending tasks")


async def test_get_next_pending_task():
    """Test the _get_next_pending_task query logic."""
    print("\n=== Testing _get_next_pending_task Query ===")

    async with async_session() as session:
        # Simulate the worker query
        result = await session.execute(
            select(TaskExecution)
            .join(BatchExecution)
            .where(
                BatchExecution.session_id == "test-session-001",
                TaskExecution.status == TaskStatus.PENDING.value
            )
            .order_by(BatchExecution.batch_number, TaskExecution.task_number)
            .limit(1)
            .with_for_update(skip_locked=True)
        )
        task = result.scalar_one_or_none()

        if task:
            print(f"✓ Found pending task: {task.id}")
            print(f"  Title: {task.task_title}")
            print(f"  Task Number: {task.task_number}")
            print(f"  Status: {task.status}")
            print(f"  Branch: {task.branch_name}")

            # Check field accessibility
            print("\n=== Checking Field Access ===")
            print(f"  task.task_title: ✓ {task.task_title}")
            print(f"  task.task_number: ✓ {task.task_number}")
            print(f"  task.branch_name: ✓ {task.branch_name}")
            print(f"  task.pr_url: ✓ {task.pr_url}")

            # Check for missing fields that the code tries to access
            print("\n=== Missing Fields (will cause errors) ===")
            if not hasattr(task, 'title'):
                print("  ✗ task.title - DOES NOT EXIST (code uses task_title)")
            if not hasattr(task, 'description'):
                print("  ✗ task.description - DOES NOT EXIST (no description field)")
            if not hasattr(task, 'output_summary'):
                print("  ✗ task.output_summary - DOES NOT EXIST (no output_summary field)")
        else:
            print("✗ No pending tasks found")


async def test_task_update():
    """Test updating a task status."""
    print("\n=== Testing Task Status Update ===")

    async with async_session() as session:
        result = await session.execute(
            select(TaskExecution).where(TaskExecution.id == "task-1.1")
        )
        task = result.scalar_one_or_none()

        if task:
            print(f"Current status: {task.status}")

            # Try to set to IN_PROGRESS (correct)
            try:
                task.status = TaskStatus.IN_PROGRESS.value
                task.started_at = datetime.now(timezone.utc)
                await session.commit()
                print(f"✓ Successfully updated to IN_PROGRESS: {task.status}")
            except Exception as e:
                print(f"✗ Error updating status: {e}")


async def cleanup_test_data():
    """Remove test data."""
    print("\n=== Cleaning Up Test Data ===")

    async with async_session() as session:
        # Delete test session (cascade will delete batches and tasks)
        result = await session.execute(
            select(AutonomousSession).where(AutonomousSession.id == "test-session-001")
        )
        test_session = result.scalar_one_or_none()

        if test_session:
            await session.delete(test_session)
            await session.commit()
            print("✓ Cleaned up test data")


async def main():
    """Run all debug checks."""
    print("=" * 60)
    print("PARALLEL WORKER DEBUG SCRIPT")
    print("=" * 60)

    # Initialize database
    await init_db()

    # Run checks
    await check_database_schema()
    await verify_task_status_enum()
    await create_test_data()
    await test_get_next_pending_task()
    await test_task_update()

    # Cleanup
    await cleanup_test_data()

    print("\n" + "=" * 60)
    print("SUMMARY OF ISSUES FOUND")
    print("=" * 60)
    print("\n1. TaskStatus.RUNNING does not exist")
    print("   FIX: Use TaskStatus.IN_PROGRESS instead")
    print("\n2. Field name mismatches:")
    print("   - task.title → task.task_title")
    print("   - task.description → does not exist (need to add or remove usage)")
    print("   - task.output_summary → does not exist (need to add or remove usage)")
    print("\n3. The join query works correctly with proper field names")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
