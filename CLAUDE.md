# CLAUDE.md

> **Last Updated:** 2026-01-13 17:30

## MANDATORY RULES (Enforced by Hooks)

**These rules are NON-NEGOTIABLE. Pre-commit hooks and Claude Code hooks WILL block violations.**

### 1. Documentation Rules (ENFORCED)

**ONE MASTER PLAN RULE:**
- Only `docs/plans/MASTER_PLAN.md` exists - NEVER create new plan files
- Update existing plan, don't create new ones
- Hook blocks: Any new file in `docs/plans/` except MASTER_PLAN.md

**ONE SPEC RULE:**
- Only `docs/specs/commandcenter3.md` exists - NEVER create new spec files
- Update existing spec, don't create new ones

**FRONTMATTER REQUIREMENTS (ENFORCED):**
All markdown files in `docs/` MUST have:
```yaml
---
title: Human-Readable Title    # OR name: (for skills)
updated: YYYY-MM-DD HH:MM      # MUST include time (15:47, not just date)
---
```

**Common violations:**
- `updated: 2026-01-12` = Missing time
- `updated: 2026-01-12 15:47` = Correct format

**FILENAME RULES (ENFORCED):**
- Lowercase kebab-case only: `memory-system.md`
- NO dates in filenames: `plan-2026-01-12.md`
- NO status prefixes: `WIP-feature.md`
- NO version suffixes: `spec-v2.md`

### 2. Repository Root Rules (ENFORCED)

**ALLOWED in project root ONLY:**
- README.md, AGENTS.md, CLAUDE.md
- LICENSE.md, SECURITY.md, CONTRIBUTING.md
- Package files: package.json, pyproject.toml, etc.
- Config files: .gitignore, .env.example, tsconfig.json

**BLOCKED in project root:**
- Test scripts: `test-*.sh`, `test-*.py` - Use `scripts/tests/`
- Utility scripts: `fix-*.sh`, `apply-*.ts` - Use `scripts/`
- Session files: `session-*.md` - Use `docs/sessions/` or delete
- SQL files: `*.sql` - Use `migrations/`
- Any other .md files - Use `docs/` or `skills/`

### 3. Pipeline Rules (CRITICAL)

- **NEVER use --reload** for autonomous execution (kills background tasks)
- **USE WORKTREE POOL** for parallel execution (prevents git corruption)
- **92-97% efficiency** validated in PipelineHardening testing

---

## Skills Reference

| Priority | Skill | When |
|----------|-------|------|
| P0 | `skills/operations/SKILL.md` | Pipeline, agents, startup |
| P0 | `skills/lessons/SKILL.md` | **CHECK FIRST for known issues** |
| P1 | `skills/documentation-protocol/SKILL.md` | Any docs/ changes |
| P1 | `skills/repository-hygiene/SKILL.md` | Creating files |

---

## Quick Start

```bash
# Backend (NO --reload for autonomous!)
cd backend && source .venv/bin/activate && uvicorn app.main:app --port 8001

# Frontend
cd frontend && npm run dev

# Run pipeline (after integration)
curl -X POST http://localhost:8001/api/v1/autonomous/start \
  -H "Content-Type: application/json" \
  -d '{"plan_path": "docs/plans/MASTER_PLAN.md", "execution_mode": "dagger"}'
```

---

## Source of Truth

| Document | Purpose |
|----------|---------|
| `docs/specs/commandcenter3.md` | Complete feature specification |
| `docs/plans/MASTER_PLAN.md` | Current execution plan (SINGLE plan) |
| `docs/reference/runbook.md` | Operations guide |
| `AGENTS.md` | AI agent instructions |

---

## Current Status (2026-01-13)

**Project:** CC4 - Clean-slate rebuild of CommandCenter

| Component | Status |
|-----------|--------|
| Frontend | Ready (38 components, VISLZR Canvas) |
| Backend Models | Ready (13 Pydantic models) |
| Skills System | Ready (9 active, 15+ archived) |
| Documentation | Ready (complete spec, runbook) |
| Pipeline | **READY FOR INTEGRATION** from PipelineHardening |

### Pipeline Validation Results (PipelineHardening)

- 2-4 tasks: 92-97% parallel efficiency
- All git integrity tests passed
- Error isolation validated
- Ready for extraction to CC4

---

## Next Step

**Phase 1:** Extract pipeline from `/Users/danielconnolly/Projects/PipelineHardening`

See `docs/plans/MASTER_PLAN.md` for detailed tasks.
