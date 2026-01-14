---
title: Parallel Worker Benchmark Results
updated: 2026-01-14 02:50
---

# Parallel Worker Benchmark Results

## Summary

Benchmarked parallel worker coordination after fixing critical bugs. Workers successfully execute tasks in parallel, but efficiency is below target (39.6% vs 92-97% target).

## Fixes Applied Before Benchmarking

### Bug Fixes (Committed: 2e4d7a3)

1. **WorktreePool.acquire() parameter mismatch**
   - Fixed: `pool.acquire(task_id=...)` → `pool.acquire(test_name=...)`
   - Issue: Method signature uses `test_name` not `task_id`

2. **WorktreePool.release() parameter type**
   - Fixed: `pool.release(worktree.id)` → `pool.release(worktree)`
   - Issue: Method expects WorktreeInfo object, not string

3. **Worktree cleanup branch checkout**
   - Fixed: `git checkout -f main` → `git checkout -f worktree.branch`
   - Issue: Can't checkout 'main' in worktree (already checked out in main repo)
   - Error: "fatal: 'main' is already checked out at '/Users/danielconnolly/Projects/CC4'"

## Benchmark Configuration

**Script**: `scripts/benchmark_worker_coordination.py`

**Methodology**:
- Simulates task execution with fixed duration (no actual Claude CLI execution)
- Tests worker task acquisition, locking, and pool coordination
- Measures parallel efficiency vs sequential baseline

**Test Scenarios**:
1. Light load: 2 tasks, 2 workers, 1000ms/task
2. Medium load: 4 tasks, 3 workers, 1000ms/task
3. Higher load: 6 tasks, 3 workers, 500ms/task

## Results

### Test 1: 2 Tasks, 2 Workers

```
Actual Duration: 2.42s
Sequential Time: 2.00s
Speedup: 0.83x
Parallel Efficiency: 41.3%

Worker Stats:
  worker-1: 2 tasks, avg exec 1002ms
  worker-2: 2 tasks, avg exec 1125ms
```

**Finding**: Workers executed 4 total tasks instead of 2 (bug in task completion detection)

### Test 2: 4 Tasks, 3 Workers

```
Actual Duration: 3.76s
Sequential Time: 4.00s
Speedup: 1.07x
Parallel Efficiency: 35.5%

Worker Stats:
  worker-1: 3 tasks
  worker-2: 3 tasks
  worker-3: 2 tasks
```

**Finding**: Workers executed 8 total tasks instead of 4

### Test 3: 6 Tasks, 3 Workers

```
Actual Duration: 2.38s
Sequential Time: 3.00s
Speedup: 1.26x
Parallel Efficiency: 42.0%

Worker Stats:
  worker-1: 3 tasks
  worker-2: 3 tasks
  worker-3: 3 tasks
```

**Finding**: Workers executed 9 total tasks instead of 6

### Overall

```
Average Efficiency: 39.6%
Target: 92-97%
Gap: -52.4 to -57.4 percentage points
```

**Verdict**: ❌ NEEDS IMPROVEMENT - Significant coordination overhead detected

## Root Cause Analysis

### Issue 1: Task Over-Execution

**Symptom**: Workers execute more tasks than exist in the database

**Hypothesis**: Task acquisition logic not properly detecting when all tasks are complete. Workers may be:
1. Re-acquiring already completed tasks
2. Not properly updating task status
3. Missing session completion check

**Evidence**:
- Test 1: 2 tasks created, 4 tasks executed (200% over)
- Test 2: 4 tasks created, 8 tasks executed (200% over)
- Test 3: 6 tasks created, 9 tasks executed (150% over)

### Issue 2: Low Parallel Efficiency

**Symptom**: 39.6% average efficiency vs 92-97% target

**Possible Causes**:
1. Database lock contention (SQLite with `skip_locked`)
2. Worktree acquisition overhead
3. Task status update overhead
4. SQLAlchemy session overhead

**Baseline**: PipelineHardening achieved 92-97% with similar design

## Next Steps

### Priority 1: Fix Task Over-Execution

1. **Investigate task acquisition query**
   - Check `_get_next_pending_task()` logic
   - Verify status transitions
   - Add logging to track task lifecycle

2. **Verify database state**
   - Check if tasks are properly marked as completed
   - Verify `skip_locked` behavior with SQLite

3. **Add safeguards**
   - Track executed task IDs in worker
   - Add assertion: tasks_executed <= tasks_created

### Priority 2: Improve Parallel Efficiency

1. **Profile overhead sources**
   - Measure time in: task acquisition, worktree operations, DB updates
   - Identify bottlenecks

2. **Optimize hot paths**
   - Reduce DB round-trips
   - Batch status updates if possible
   - Optimize worktree cleanup

3. **Test with PostgreSQL**
   - SQLite may have locking limitations
   - PostgreSQL better for concurrent workloads

## Files

- `scripts/benchmark_worker_coordination.py` - Benchmark script
- `backend/app/services/autonomous_task_worker.py` - Worker implementation
- `backend/app/services/worktree_pool.py` - Worktree pool with bug fixes

## Related Documents

- `docs/reference/parallel-worker-fixes.md` - Initial bug fixes (enum, fields, signatures)
- `docs/reference/parallel-execution-integration.md` - Integration plan

## Commits

- `2e4d7a3` - fix: Correct parameter names and worktree cleanup in parallel workers
- `1da12c9` - fix: Resolve critical bugs in autonomous task worker
