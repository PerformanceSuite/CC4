---
title: CC4 Operations Runbook
type: reference
status: active
created: 2026-01-13
updated: 2026-01-13 17:30
owner: daniel
tags: [operations, pipeline, autonomous, debugging]
---

# CC4 Operations Runbook

## Quick Start

```bash
# Start backend (NEVER use --reload for autonomous execution)
cd ~/Projects/CC4/backend
source .venv/bin/activate
uvicorn app.main:app --port 8001

# Start frontend
cd ~/Projects/CC4/frontend
npm run dev

# Run pipeline (after integration)
curl -X POST http://localhost:8001/api/v1/autonomous/start \
  -H "Content-Type: application/json" \
  -d '{
    "plan_path": "docs/plans/MASTER_PLAN.md",
    "execution_mode": "dagger"
  }'
```

---

## Critical Rules

### 1. NEVER use `--reload` for autonomous execution

**Why:** File changes trigger server restart, killing background tasks mid-execution.

**Symptom:** Files created but never committed. Tasks stuck in "executing" state.

**Correct:**
```bash
uvicorn app.main:app --port 8001
```

**Wrong:**
```bash
uvicorn app.main:app --port 8001 --reload  # DON'T DO THIS
```

### 2. Use Worktree Pool for parallel execution

**Why:** Multiple tasks on the same repo causes git corruption.

**Solution:** Worktree pool provides isolated working directories.

**Validation:** 92-97% parallel efficiency in PipelineHardening testing.

### 3. Don't manually intervene during execution

**Why:** Manual commits/reverts pollute git state, causing subsequent tasks to fail.

**Rule:** Let the pipeline complete or fail on its own. Fix issues AFTER execution ends.

---

## Execution Modes

| Mode | Parallelism | Isolation | Use Case |
|------|-------------|-----------|----------|
| `worktree` | Parallel (92-97%) | High (separate dirs) | Production batches |
| `local` | Sequential | None (shared repo) | Debugging |
| `dagger` | Parallel | Full (containers) | CI/CD |

### Worktree Pool Mode (Recommended)
- Each task gets isolated worktree
- No git race conditions
- 92-97% parallel efficiency validated
- Automatic cleanup after task completion

### Local Mode (Sequential Only)
- Forces `max_concurrent=1`
- Best for: Debugging, small batches

### Dagger Mode
- Container-based isolation
- Full parallel support
- Best for: CI/CD, production

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CC4 Autonomous Pipeline                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Plan Parser  │───▶│  Batch       │───▶│  Parallel    │  │
│  │              │    │  Orchestrator│    │  Orchestrator│  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                 │            │
│                                                 ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Worktree     │◀───│  Execution   │◀───│  Task        │  │
│  │ Pool         │    │  Worker      │    │  Executor    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Services (After Integration)

| Service | Purpose |
|---------|---------|
| `worktree_pool.py` | Manage pool of git worktrees for parallel execution |
| `parallel_orchestrator.py` | Coordinate parallel task execution |
| `execution_worker.py` | Worker that processes individual tasks |
| `task_executor.py` | Execute Claude CLI commands |
| `batch_orchestrator.py` | Manage batch execution lifecycle |
| `plan_parser.py` | Parse MASTER_PLAN.md into batches/tasks |

---

## Common Failures & Fixes

### "Git corruption during parallel execution"

**Cause:** Multiple tasks accessing same git repo

**Fix:** Use worktree pool (validated in PipelineHardening)

**Verification:**
```bash
git fsck --no-progress  # Should show no errors
```

### "Claude CLI not found"

**Cause:** PATH doesn't include `/opt/homebrew/bin`

**Fix:** Set PATH in subprocess environment

**Verify:**
```bash
which claude  # Should show /opt/homebrew/bin/claude
```

### "Tasks stuck in executing state"

**Causes:**
1. Server restarted (--reload bug)
2. Process killed externally
3. Timeout exceeded

**Fix:** Check database and mark stuck sessions as failed.

### "Database greenlet errors"

**Cause:** Async DB operations in background tasks

**Fix:** Use `get_sync_db()` for all background task DB operations

**Pattern:**
```python
# WRONG - causes greenlet error
async def background_task():
    async with get_db() as db:  # DON'T
        ...

# CORRECT
def background_task():
    with get_sync_db() as db:  # DO THIS
        ...
```

---

## Monitoring

### Check execution status
```bash
curl -s http://localhost:8001/api/v1/autonomous/{execution_id}/status | python3 -m json.tool
```

### Watch logs
```bash
tail -f ~/Projects/CC4/backend/logs/app.log
```

### Check worktree status
```bash
git worktree list
```

---

## Cleanup Commands

### Delete local feature branches
```bash
git branch | grep -E 'feature/|agent/' | xargs git branch -D
```

### Prune stale remote references
```bash
git fetch --prune
git remote prune origin
```

### Clean worktrees
```bash
git worktree prune
```

---

## Lessons Learned

### From PipelineHardening Validation (2026-01-13)

1. **Worktree isolation works** - 92-97% parallel efficiency
2. **Error isolation works** - Failed tasks don't affect others
3. **Git integrity maintained** - All fsck tests passed
4. **Resource cleanup works** - No orphaned worktrees

### From CC3 Development (2026-01)

1. **subprocess doesn't inherit shell PATH** - Must explicitly add `/opt/homebrew/bin`
2. **--reload + background tasks = disaster** - File creation triggers restart
3. **Parallel git operations corrupt state** - Must use worktree isolation
4. **Manual intervention during execution fails** - Pollutes git state
5. **Sync DB for background tasks** - Async DB causes greenlet errors

---

## Version History

| Date | Change |
|------|--------|
| 2026-01-13 | Created for CC4 with PipelineHardening integration |

---

*Last Updated: 2026-01-13 17:30*
