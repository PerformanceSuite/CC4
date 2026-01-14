---
title: Fix for Task Over-Execution Bug
updated: 2026-01-14 03:30
---

# Fix for Task Over-Execution Bug

## Summary

Fixed critical race condition in parallel worker task acquisition that caused tasks to be executed multiple times. Replaced SQLite's unreliable `SELECT...FOR UPDATE skip_locked` with an atomic UPDATE pattern.

## Root Cause

**Problem**: Multiple workers acquired the same task simultaneously due to SQLite's row-level locking limitations.

**Evidence** (from diagnostic script):
```
[worker-1] ACQUIRED task task-1 (status: pending)
[worker-3] ACQUIRED task task-1 (status: pending)
[worker-2] ACQUIRED task task-1 (status: pending)
```

All three workers saw the same task as PENDING and all "acquired" it before any could update the status.

**Why it happened:**
- SQLite doesn't fully support row-level locking like PostgreSQL
- `with_for_update(skip_locked=True)` doesn't prevent multiple transactions from locking the same row
- Database-level locking in SQLite allows race conditions

## Solution: Atomic UPDATE Pattern

Replaced the SELECT...FOR UPDATE pattern with a two-phase atomic update:

### Before (Broken)
```python
async def _get_next_pending_task(self):
    async with async_session() as session:
        # Query and lock row
        result = await session.execute(
            select(TaskExecution)
            .where(TaskExecution.status == TaskStatus.PENDING.value)
            .with_for_update(skip_locked=True)  # ❌ Doesn't work reliably in SQLite
        )
        task = result.scalar_one_or_none()

        if task:
            task.status = TaskStatus.IN_PROGRESS.value
            await session.commit()

        return task
```

**Issue**: All workers see the task as PENDING before any can update it.

### After (Fixed)
```python
async def _get_next_pending_task(self):
    from sqlalchemy import update

    async with async_session() as session:
        # Phase 1: Find next pending task ID
        result = await session.execute(
            select(TaskExecution.id)
            .where(TaskExecution.status == TaskStatus.PENDING.value)
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
                TaskExecution.status == TaskStatus.PENDING.value  # ✅ Critical condition
            )
            .values(status=TaskStatus.IN_PROGRESS.value)
        )
        result = await session.execute(stmt)
        await session.commit()

        # Check if we won the race
        if result.rowcount == 0:
            return None  # Another worker got it first

        # Fetch and return the claimed task
        result = await session.execute(
            select(TaskExecution).where(TaskExecution.id == task_id)
        )
        return result.scalar_one()
```

**Key insight**: The UPDATE only succeeds if status is STILL PENDING. Only one worker's UPDATE will succeed because:
1. Worker A executes UPDATE, changes status to IN_PROGRESS, commits
2. Worker B executes UPDATE with same task_id, but status is now IN_PROGRESS
3. Worker B's WHERE clause fails (status != PENDING), rowcount = 0
4. Worker B returns None and tries another task

## Results

### Diagnostic Test
**Before fix:**
- 4 tasks created → 7 tasks executed
- task-1 executed 3 times
- task-2 executed 2 times

**After fix:**
- 4 tasks created → 4 tasks executed ✅
- No duplicates ✅
- Atomic acquisition working perfectly

### Benchmark Results
**Before fix:**
```
Test 1 (2 tasks, 2 workers): 4 executions (200% over)
Test 2 (4 tasks, 3 workers): 8 executions (200% over)
Test 3 (6 tasks, 3 workers): 9 executions (150% over)
Average efficiency: 39.6%
```

**After fix:**
```
Test 1 (2 tasks, 2 workers): 2 executions ✅ - 82.4% efficient
Test 2 (4 tasks, 3 workers): 4 executions ✅ - 55.0% efficient
Test 3 (6 tasks, 3 workers): 6 executions ✅ - 63.1% efficient
Average efficiency: 66.8% (+68% improvement)
```

## Efficiency Analysis

Efficiency improved from 39.6% to 66.8%, but still below target (92-97%). Remaining overhead likely from:

1. **Extra database round-trip**: The two-phase approach requires:
   - SELECT to find task ID
   - UPDATE to claim it
   - SELECT to fetch task details
   - Adds ~10-20ms per acquisition

2. **SQLite database-level locking**: Unlike PostgreSQL:
   - SQLite locks entire database during writes
   - Concurrent workers wait for each other's commits
   - PostgreSQL's MVCC would reduce contention

3. **Lost races add latency**: When worker loses race:
   - Wasted UPDATE attempt
   - Must retry from beginning
   - Compounds with multiple workers

## Next Steps

1. **Profile coordination overhead** - Measure time spent in:
   - Database queries
   - Worktree operations
   - Task status updates

2. **Optimize hot paths**:
   - Reduce database round-trips if possible
   - Batch operations where feasible
   - Cache worktree pool state

3. **Test with PostgreSQL**:
   - Better concurrent write performance
   - True row-level locking with MVCC
   - Should improve efficiency significantly

## Files Modified

- `backend/app/services/autonomous_task_worker.py:88-147` - Atomic update in `_get_next_pending_task()`
- `scripts/benchmark_worker_coordination.py:115-152` - Applied fix to benchmark
- `scripts/diagnose_task_overexecution.py` - Diagnostic tool created

## Commits

- `[pending]` fix: Prevent task over-execution with atomic UPDATE pattern

## Related

- `docs/reference/parallel-benchmark-results.md` - Original bug discovery
- `docs/reference/parallel-worker-fixes.md` - Earlier fixes
