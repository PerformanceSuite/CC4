---
title: Parallel Worker Debugging and Fixes
updated: 2026-01-14 02:35
---

# Parallel Worker Debugging and Fixes

## Summary

Fixed critical bugs in `autonomous_task_worker.py` preventing task acquisition and execution in the parallel pipeline system.

## Issues Found and Fixed

### 1. TaskStatus Enum Mismatch

**Problem**: Code referenced `TaskStatus.RUNNING` which doesn't exist in the enum.

**Available statuses**:
```python
class TaskStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    PR_CREATED = "pr_created"
    REVIEWING = "reviewing"
    FIXING = "fixing"
    APPROVED = "approved"
    MERGED = "merged"
    FAILED = "failed"
```

**Fix**: Changed all references from `TaskStatus.RUNNING` to `TaskStatus.IN_PROGRESS.value`

**Files affected**: `backend/app/services/autonomous_task_worker.py`

**Lines changed**:
- Line 97: Query filter comparison
- Line 107: Status update when acquiring task
- Line 172: Status update on successful PR creation
- Line 178: Status update on execution failure
- Line 188: Status update on timeout
- Line 202: Status update on worker error

### 2. SQLAlchemy Enum Value Bug

**Problem**: Using enum objects instead of their string values in SQLAlchemy queries and updates.

**Error**:
```
sqlite3.ProgrammingError: Error binding parameter: type 'TaskStatus' is not supported
```

**Fix**: All enum comparisons and assignments now use `.value` to get the string value:
```python
# Before (incorrect)
TaskExecution.status == TaskStatus.PENDING
task.status = TaskStatus.IN_PROGRESS

# After (correct)
TaskExecution.status == TaskStatus.PENDING.value
task.status = TaskStatus.IN_PROGRESS.value
```

### 3. TaskExecutor execute_task() Signature Mismatch

**Problem**: Worker calling `execute_task()` with incorrect parameters.

**Expected signature**:
```python
async def execute_task(
    task_number: str,
    task_title: str,
    implementation: str,
    files: List[str],
    verification_steps: List[str],
    batch_number: int = 1,
    auto_merge: bool = True,
    worktree_path: Optional[Path] = None,
    branch_name: Optional[str] = None,
) -> ExecutionResult:
```

**Fix**: Updated worker to extract task data from `extra_data` JSON field and pass all required parameters:

```python
# Extract from extra_data
extra = task_obj.extra_data or {}
implementation = extra.get("implementation", "")
files = extra.get("files", [])
verification_steps = extra.get("verification_steps", [])
batch_number = extra.get("batch_number", 1)

# Call with correct signature
exec_result = await executor.execute_task(
    task_number=task_obj.task_number,
    task_title=task_obj.task_title,
    implementation=implementation,
    files=files,
    verification_steps=verification_steps,
    batch_number=batch_number,
    auto_merge=False,
    worktree_path=worktree.path,
    branch_name=task_obj.branch_name,
)
```

### 4. Field Name Mismatches

**Problem**: Code accessing non-existent fields on TaskExecution model.

**Issues**:
- Using `task.title` instead of `task.task_title`
- Using `task.description` (doesn't exist)
- Using `task.output_summary` (doesn't exist)

**Fix**: Updated all field references to match actual model:
- `task.task_title` (not `title`)
- `task.error` (instead of `output_summary`)
- Task implementation details stored in `extra_data` JSON field

**TaskExecution model fields**:
```python
id: String
batch_execution_id: String
task_number: String         # e.g., "1.1", "1.2"
task_title: String          # Human-readable title
branch_name: String
pr_number: Integer
pr_url: String
status: String              # Enum value as string
review_rounds: Integer
commits: JSON               # List of commit SHAs
started_at: DateTime
completed_at: DateTime
error: Text                 # Error messages
extra_data: JSON            # Additional task data
```

### 5. TaskExecutor Initialization

**Problem**: Worker passing incorrect parameters to TaskExecutor constructor.

**Fix**: Changed from `task_id` and `working_dir` to `repo_path`:
```python
# Before (incorrect)
executor = TaskExecutor(
    task_id=str(task.id),
    working_dir=str(worktree.path),
)

# After (correct)
executor = TaskExecutor(
    repo_path=str(worktree.path),
)
```

## Task Data Structure

Tasks must have properly structured `extra_data` for execution:

```python
{
    "implementation": "Detailed implementation instructions",
    "files": ["file1.py", "file2.py"],
    "verification_steps": ["pytest tests/", "npm run lint"],
    "batch_number": 1
}
```

## Verification

Created two test scripts to validate fixes:

### 1. `scripts/debug_parallel_worker.py`
- Verifies database schema
- Tests TaskStatus enum values
- Creates test data
- Tests `_get_next_pending_task()` query
- Validates field accessibility

### 2. `scripts/test_worker_execution.py`
- Tests end-to-end task acquisition
- Validates status transitions
- Checks all field access patterns
- Confirms proper data structure

**Test results**: ✓ All tests passing

## Impact

These fixes enable:
1. ✓ Workers can query for pending tasks
2. ✓ Workers can acquire and lock tasks (preventing duplicate execution)
3. ✓ Task status properly transitions PENDING → IN_PROGRESS → PR_CREATED/FAILED
4. ✓ Task data properly structured for execution
5. ✓ All model fields accessible without errors

## Next Steps

1. Test workers can acquire and execute tasks in worktree pool
2. Run performance benchmarks (2-task, 4-task scenarios)
3. Validate parallel execution efficiency (target: 92-97% from PipelineHardening)

## Files Modified

- `backend/app/services/autonomous_task_worker.py` - All bug fixes
- `scripts/debug_parallel_worker.py` - Debugging script (new)
- `scripts/test_worker_execution.py` - Verification script (new)

## References

- Task acquisition: `autonomous_task_worker.py:88-112`
- Task execution: `autonomous_task_worker.py:114-195`
- TaskStatus enum: `backend/app/models/autonomous.py:28-37`
- TaskExecution model: `backend/app/models/autonomous.py:98-150`
