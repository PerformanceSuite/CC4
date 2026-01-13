# CLAUDE.md

> **Last Updated:** 2026-01-13 10:40

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
- ❌ `updated: 2026-01-12` → Missing time
- ✅ `updated: 2026-01-12 15:47` → Correct format

**FILENAME RULES (ENFORCED):**
- Lowercase kebab-case only: `memory-system.md`
- NO dates in filenames: ❌ `plan-2026-01-12.md`
- NO status prefixes: ❌ `WIP-feature.md`
- NO version suffixes: ❌ `spec-v2.md`

### 2. Repository Root Rules (ENFORCED)

**ALLOWED in project root ONLY:**
- README.md, AGENTS.md, CLAUDE.md, NEXT_STEPS.md, CONTRIBUTING.md
- LICENSE.md, SECURITY.md
- Package files: package.json, pyproject.toml, etc.
- Config files: .gitignore, .env.example, tsconfig.json

**BLOCKED in project root:**
- ❌ Test scripts: `test-*.sh`, `test-*.py` → Use `scripts/tests/` or `backend/app/tests/`
- ❌ Utility scripts: `fix-*.sh`, `apply-*.ts` → Use `scripts/`
- ❌ Session files: `session-*.md` → Use `docs/sessions/` or delete
- ❌ SQL files: `*.sql` → Use `migrations/`
- ❌ Any other .md files → Use `docs/` or `skills/`

**Hook enforcement:**
Pre-commit hook and PreToolUse hook will BLOCK these violations immediately.

### 3. Pipeline Rules (CRITICAL)
- **NEVER use --reload** for autonomous execution (kills background tasks)
- **🔴 LOCAL MODE DISABLED** - P0 git corruption bug (discovered 2026-01-13)
- **✅ USE DAGGER MODE ONLY** - Validated safe (3/3 tests, 100% success, no corruption)
- **Bug details:** Multi-task batches in local mode corrupt git repo (55 empty objects, broken refs, DB readonly)

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

# Run pipeline
curl -X POST http://localhost:8001/api/v1/autonomous/start \
  -H "Content-Type: application/json" \
  -d '{"plan_path": "docs/plans/MASTER_PLAN.md", "execution_mode": "dagger"}'
```

## Source of Truth

| Document | Purpose |
|----------|---------|
| `docs/specs/commandcenter3.md` | Complete feature specification |
| `docs/plans/MASTER_PLAN.md` | Current execution plan (SINGLE plan) |
| `NEXT_STEPS.md` | Current priorities |
| `AGENTS.md` | Coding standards |

## Current Status (2026-01-13 10:40)

- 1746+ backend tests passing (100%)
- Dagger mode VALIDATED (3/3 E2E tests passed, no corruption)
- **🔴 P0 CRITICAL:** Local mode git corruption bug (use Dagger only)
- **✅ RESOLVED:** Skill enforcement via hooks (implemented 2026-01-12)

See `NEXT_STEPS.md` for current priorities.
