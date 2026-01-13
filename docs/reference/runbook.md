---
title: Autonomous Pipeline Operations Runbook
type: reference
status: active
created: 2026-01-11
updated: 2026-01-11
owner: danger-dan
tags: [operations, pipeline, autonomous, debugging]
---

# Autonomous Pipeline Operations Runbook

## Quick Start

```bash
# Start backend (NEVER use --reload for autonomous execution)
cd ~/Projects/CommandCenterV3/backend
source .venv/bin/activate
uvicorn app.main:app --port 8001

# Run a phase
curl -X POST http://localhost:8001/api/v1/autonomous/start \
  -H "Content-Type: application/json" \
  -d '{
    "plan_path": "/Users/danielconnolly/Projects/CommandCenterV3/docs/plans/MASTER_PLAN.md",
    "start_batch": 31,
    "end_batch": 37,
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

### 2. Local mode runs sequentially (by design)

**Why:** Multiple tasks running `git checkout` on the same repo causes race conditions.

**Symptom:** Only 1 of N tasks succeeds, others fail with "no commits between branches."

**Fix applied:** `task_executor.py` forces `max_concurrent=1` in local mode.

**For parallel execution:** Use `"execution_mode": "dagger"` - each task runs in isolated container.

### 3. Don't manually intervene during execution

**Why:** Manual commits/reverts pollute git state, causing subsequent tasks to fail.

**Symptom:** "No commits between main and branch" errors.

**Rule:** Let the pipeline complete or fail on its own. Fix issues AFTER execution ends.

---

## Execution Modes

| Mode | Parallelism | Isolation | Speed | Use Case |
|------|-------------|-----------|-------|----------|
| `local` | Sequential | None (shared repo) | Slower | Development, debugging |
| `dagger` | Parallel (4x) | Full (containers) | Faster | Production, large batches |

### Local Mode
- Uses Claude Max subscription (FREE)
- Runs on host machine
- Tasks execute one at a time
- Best for: Debugging, small batches

### Dagger Mode  
- Uses Claude Max subscription (FREE)
- Runs in Docker containers
- Tasks execute in parallel (4 concurrent)
- Best for: Large batches, production runs

---

## Common Failures & Fixes

### "Claude CLI not found"

**Cause:** PATH doesn't include `/opt/homebrew/bin`

**Fix:** Already applied in `agent_service.py` (lines 338-339, 603)

**Verify:**
```bash
which claude  # Should show /opt/homebrew/bin/claude
```

### "No commits between main and branch"

**Causes:**
1. Manual intervention during execution
2. Git race condition (fixed)
3. Agent created no files

**Diagnosis:**
```bash
git log --oneline origin/main..origin/feature/batch-X-task-Y
```

**Fix:** Clean up branches and rerun:
```bash
git push origin --delete feature/batch-X-task-Y
# Then rerun the batch
```

### Tasks stuck in "executing" state

**Causes:**
1. Server restarted (--reload bug)
2. Process killed externally
3. Timeout (30 min limit)

**Diagnosis:**
```python
# Check session status
from app.database import get_sync_db
from app.models.autonomous import AutonomousSession
from sqlalchemy import select

with get_sync_db() as db:
    result = db.execute(
        select(AutonomousSession).order_by(AutonomousSession.started_at.desc()).limit(5)
    )
    for s in result.scalars():
        print(f"{s.id}: {s.status} - {s.tasks_completed}/{s.tasks_total}")
```

**Fix:** Mark stuck sessions as failed:
```python
with get_sync_db() as db:
    session = db.query(AutonomousSession).filter_by(id="exec_XXX").first()
    session.status = "failed"
    db.commit()
```

### Database greenlet errors

**Cause:** Async DB operations in background tasks

**Fix:** Already applied - all background tasks use `get_sync_db()`

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
tail -f ~/Projects/CommandCenterV3/backend/logs/app.log
```

### Database queries
```python
from app.database import get_sync_db
from app.models.autonomous import AutonomousSession, TaskExecution, BatchExecution
from sqlalchemy import select, text

with get_sync_db() as db:
    # Recent sessions
    result = db.execute(
        select(AutonomousSession).order_by(AutonomousSession.started_at.desc()).limit(5)
    )
    for s in result.scalars():
        print(f"{s.id}: {s.status}")
    
    # Failed tasks with errors
    result = db.execute(
        select(TaskExecution).where(TaskExecution.status == "failed")
    )
    for t in result.scalars():
        print(f"{t.task_number}: {t.error}")
```

---

## Branch Cleanup

### Delete local feature branches
```bash
git branch | grep -E 'feature/|agent/' | xargs git branch -D
```

### Delete remote feature branches
```bash
git branch -r | grep -v main | grep -v HEAD | \
  sed 's/origin\///' | \
  xargs -I {} git push origin --delete {}
```

### Prune stale remote references
```bash
git fetch --prune
git remote prune origin
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Autonomous Pipeline                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Plan Parser  │───▶│  Batch       │───▶│  Execution   │  │
│  │              │    │  Orchestrator│    │  Runner      │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                 │            │
│                                                 ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Merge        │◀───│  PR Reviewer │◀───│  Task        │  │
│  │ Manager      │    │  + Fix Agent │    │  Executor    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                 │            │
│                                                 ▼            │
│                                          ┌──────────────┐   │
│                                          │  Agent       │   │
│                                          │  Service     │   │
│                                          │  (Claude CLI)│   │
│                                          └──────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `services/plan_parser.py` | Parse MASTER_PLAN.md into batches/tasks |
| `services/batch_orchestrator.py` | Manage batch execution state |
| `services/execution_runner.py` | Run batches with sync DB operations |
| `services/task_executor.py` | Execute individual tasks (sequential in local) |
| `services/agent_service.py` | Run Claude CLI (local or dagger) |
| `agents/pr_reviewer.py` | Review PRs for quality |
| `agents/fix_agent.py` | Fix issues found in review |
| `services/merge_manager.py` | Merge approved PRs |

---

## Lessons Learned

### Phase 1-2 (January 2026)

1. **subprocess doesn't inherit shell PATH** - Must explicitly add `/opt/homebrew/bin`

2. **--reload + background tasks = disaster** - File creation triggers restart, killing tasks

3. **Parallel git operations corrupt state** - Force sequential in local mode

4. **Manual intervention during execution fails** - Pollutes git state for remaining tasks

5. **Sync DB for background tasks** - Async DB causes greenlet errors in `asyncio.create_task()`

6. **Git commits = source of truth** - Don't maintain separate status files

---

## Version History

| Date | Change | Commit |
|------|--------|--------|
| 2026-01-12 | Force sequential local execution | `f66b818` |
| 2026-01-12 | Add PATH fix to _execute_local | `9107dd9` |
| 2026-01-12 | Document --reload bug | `ed526c2` |
| 2026-01-11 | Phase 1 complete | PR #8 |
| 2026-01-11 | Phase 2.1 complete | PR #9 |
| 2026-01-12 | Phase 2.2-2.3 complete (agent) | PR #10 |
