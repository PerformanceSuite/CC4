# CommandCenter 4 (CC4)

Clean-slate rebuild of CommandCenter, preserving valuable assets from CC3 while awaiting pipeline hardening.

## Status: Foundation Phase

This repository contains the valuable non-pipeline assets extracted from CommandCenterV3, ready for a fresh implementation.

## Source Repositories

| Repo | Purpose | Status |
|------|---------|--------|
| `CommandCenterV3/` | Original platform (pipeline works in Dagger mode) | Reference/Backup |
| `PipelineHardening/` | Isolated pipeline development (worktree parallelization) | Active Development |
| `CC4/` (this repo) | Clean rebuild with proven patterns | Foundation |

## What's Included

### Skills (10 active + archived patterns)
All hard-won knowledge from months of development:
- `lessons/` - Critical debugging incidents (P0)
- `operations/` - Pipeline startup, modes, critical rules (P0)
- `damage-control/` - Safety hooks for destructive commands (P0)
- `context-management/` - Stay under 50% context (P0)
- `patterns/` - Frontend, agent code patterns (P1)
- `autonomy/` - Ralph loops, long-running agents (P1)
- Plus 15+ archived patterns (subagent development, TDD, code review, etc.)

### Documentation Templates
- `AGENTS.md` - AI agent instructions
- `CLAUDE.md` - Claude Code entry point with mandatory rules
- `NEXT_STEPS.md` - Current priorities template

### Snapshot Bundle
Comprehensive documentation of CC3's architecture, surfaces, and components.

### Pending Frontend Integration
- `frontend/src/components/.pending-integration/VISLZR-UI-Cohesion-Bundle/`
- Canvas node styling standardization for later integration

### Hook Enforcement
- `.claude/` - Pre-configured hooks for skill enforcement

## Integration Path

```
Phase 1 (Current): Foundation
├── Skills, lessons, patterns ready
├── Documentation templates ready
└── Awaiting pipeline hardening

Phase 2 (After PipelineHardening):
├── Pull pipeline services from CC3
├── Integrate worktree pool from PipelineHardening
└── Build backend/frontend

Phase 3: MVP Implementation
├── Execute Phase 4 from CC3's MASTER_PLAN
└── Full platform rebuild
```

## Key Lessons from CC3

1. **Never `--reload` for autonomous execution** - Kills background tasks
2. **Local mode = sequential only** - Git race conditions
3. **PATH needs `/opt/homebrew/bin`** - Subprocess doesn't inherit shell PATH
4. **Skills without enforcement are ignored** - Use hooks
5. **Dagger mode validated** - 3/3 E2E tests passed
6. **Local mode has P0 git corruption bug** - Use Dagger only for multi-task

## Quick Reference

| Need | Location |
|------|----------|
| Debugging lessons | `skills/lessons/SKILL.md` |
| Pipeline operations | `skills/operations/SKILL.md` |
| Code patterns | `skills/patterns/SKILL.md` |
| CC3 architecture | `Snapshot/cc3_repo_overview.md` |
| Frontend bundle | `frontend/src/components/.pending-integration/` |

---

*Built on the shoulders of 100+ hours of CC3 debugging.*
