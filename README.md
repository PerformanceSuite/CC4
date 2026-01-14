# CommandCenter 4 (CC4)

Clean-slate rebuild of CommandCenter with hardened pipeline ready for integration.

## Status: Pipeline Integration Ready

CC4 contains all assets from CC3 (frontend, models, skills, documentation). The pipeline has been hardened in isolation and is **validated and ready for extraction**.

## Current Phase

**Phase 1: Pipeline Integration** - Extract hardened pipeline from PipelineHardening into CC4.

See `docs/plans/MASTER_PLAN.md` for detailed tasks.

## What's Ready

| Component | Status | Details |
|-----------|--------|---------|
| Frontend | Ready | 38 React components, VISLZR Canvas, Dashboard, Execution view |
| Backend Models | Ready | 13 Pydantic models (1,723 lines) |
| Skills System | Ready | 9 active skills, 15+ archived patterns |
| Documentation | Ready | Complete spec, runbook, MASTER_PLAN |
| Pipeline | **VALIDATED** | Ready for extraction from PipelineHardening |

## Pipeline Validation Results

From `/Users/danielconnolly/Projects/PipelineHardening`:

| Test | Tasks | Speedup | Efficiency | Git Integrity |
|------|-------|---------|------------|---------------|
| 2 parallel | 2 | 1.94x | 96.8% | PASSED |
| 3 parallel | 3 | 2.88x | 96.0% | PASSED |
| 4 parallel | 4 | 3.70x | 92.4% | PASSED |
| Error handling | 3 | - | - | PASSED |

**Key Finding:** Worktree isolation prevents git corruption during parallel execution.

## Source Repositories

| Repo | Purpose | Status |
|------|---------|--------|
| `CC4/` (this repo) | Clean rebuild with proven patterns | **Active** |
| `PipelineHardening/` | Pipeline with worktree pool | **Validated, ready for extraction** |
| `CommandCenterV3/` | Original platform | Archive/Reference |

## Skills System

### Active Skills (P0-P2)

| Skill | Priority | Purpose |
|-------|----------|---------|
| `operations` | P0 | Pipeline startup, execution modes |
| `lessons` | P0 | Critical debugging incidents |
| `damage-control` | P0 | Safety hooks for destructive commands |
| `context-management` | P0 | Stay under 50% context |
| `patterns` | P1 | Frontend, agent code patterns |
| `repository-hygiene` | P1 | File organization rules |
| `documentation-protocol` | P1 | Single source of truth |
| `autonomy` | P1 | Ralph loops, long-running agents |

### Archived Patterns (15+)
- Agent sandboxes, TDD, code review, infrastructure decisions, and more

## Key Lessons (from 100+ hours of CC3/Pipeline development)

1. **Never `--reload` for autonomous execution** - Kills background tasks
2. **Use worktree pool for parallel** - 92-97% efficiency, no git corruption
3. **PATH needs `/opt/homebrew/bin`** - Subprocess doesn't inherit shell PATH
4. **Skills without enforcement are ignored** - Use hooks
5. **Sync DB for background tasks** - Async causes greenlet errors

## Quick Start

```bash
# Backend (NO --reload for autonomous!)
cd backend && source .venv/bin/activate && uvicorn app.main:app --port 8001

# Frontend
cd frontend && npm run dev
```

## Quick Reference

| Need | Location |
|------|----------|
| Current plan | `docs/plans/MASTER_PLAN.md` |
| Feature spec | `docs/specs/commandcenter3.md` |
| Operations guide | `docs/reference/runbook.md` |
| Debugging lessons | `skills/lessons/SKILL.md` |
| Pipeline operations | `skills/operations/SKILL.md` |

---

*Built on 100+ hours of CC3 development and pipeline hardening.*
