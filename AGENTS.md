# AI Agent Instructions

Universal instructions for all AI agents working in this repository.

**Applies to:** Claude, Gemini, GPT, Copilot, and any other AI assistant.

---

## Golden Rules

1. **CHECK SKILLS FIRST:** Read `skills/MANIFEST.yaml` and invoke relevant skills before ANY work
2. **Source of truth:** `docs/specs/commandcenter3.md`
3. **Current plan:** `docs/plans/MASTER_PLAN.md`
4. **Before creating any file:** Check if it already exists
5. **Before making changes:** Read relevant existing code

---

## Part 0: Skill Governance (MANDATORY)

**Skills are institutional knowledge. They MUST be consulted before work begins.**

### Active Skills

| Skill | Priority | When Required |
|-------|----------|---------------|
| `skill-governance` | P0 | Session start, before any work |
| `damage-control` | P0 | Autonomous agents, destructive commands |
| `context-management` | P0 | Throughout session (stay under 50%) |
| `operations` | P0 | Pipeline, agent, execution |
| `patterns` | P1 | Frontend, agents, code patterns |
| `repository-hygiene` | P1 | Creating files, before commits |
| `documentation-protocol` | P1 | Any docs/ changes |
| `autonomy` | P1 | Long-running tasks, Ralph loops |
| `lessons` | P2 | Debugging, errors |

### Key Principles (Summary)

1. **Docs:** Update existing documents, never create new (documentation-protocol)
2. **Files:** No test scripts in root, proper locations (repository-hygiene)
3. **Safety:** Block `rm -rf`, force push, DROP TABLE (damage-control)
4. **Context:** Stay under 50% capacity, use selective reads (context-management)
5. **Pipeline:** Never use `--reload` for autonomous execution (operations)
6. **Agents:** Features in prompts, not code (patterns)
7. **Skills:** Never archive without extracting principles (skill-governance)

---

## Part 1: Project Context

### CC4 Overview

CC4 is a clean-slate rebuild of CommandCenter with:
- **Frontend:** 38 React components (VISLZR Canvas, Dashboard, Execution view)
- **Backend Models:** 13 Pydantic models (1,723 lines)
- **Skills System:** 9 active skills, 15+ archived patterns
- **Pipeline:** Ready for integration from PipelineHardening

### Current Phase

**Phase 1: Pipeline Integration** - Extract hardened pipeline from PipelineHardening.

See `docs/plans/MASTER_PLAN.md` for detailed tasks.

---

## Part 2: Execution Modes

### Worktree Pool Mode (Recommended for Parallel)

When running parallel tasks:
1. **Acquire** worktree from pool
2. **Execute** in isolated working directory
3. **Commit** changes in worktree
4. **Push** to feature branch
5. **Release** worktree back to pool

**Benefits:** 92-97% parallel efficiency, no git corruption.

### Local Mode (Sequential Only)

Direct execution on host machine.
- Forces `max_concurrent=1` to prevent git race conditions
- Best for: Debugging, single tasks

### Dagger Mode (Container Isolation)

Container-based execution with full isolation.
- Parallel execution supported
- Each task in separate container

### Comparison

| Mode | Parallel | Isolation | Use Case |
|------|----------|-----------|----------|
| `worktree` | Yes (92-97%) | High | Production batches |
| `local` | No (sequential) | None | Debugging |
| `dagger` | Yes | Full | CI/CD, production |

---

## Part 3: Document Management

### Directory Structure

```
project-root/
├── CLAUDE.md              # Claude Code entry point
├── AGENTS.md              # This file
├── README.md              # Human-facing overview
├── docs/
│   ├── specs/
│   │   └── commandcenter3.md  # THE source of truth
│   ├── plans/
│   │   └── MASTER_PLAN.md     # Master execution plan (ONLY plan)
│   └── reference/
│       └── runbook.md         # Operations guide
└── skills/                    # Project skills
```

### File Naming

| Rule | Correct | Incorrect |
|------|---------|-----------|
| Lowercase kebab-case | `memory-system.md` | `Memory_System.md` |
| No dates in filename | `memory-system.md` | `2026-01-05-memory.md` |

---

## Part 4: Coding Standards

### Python
- Type hints everywhere
- PEP 8 style
- Async/await for I/O
- Pydantic for validation
- Google-style docstrings

### TypeScript
- Strict mode
- Functional components with hooks
- Zustand for state
- Tailwind for styling

### Git Commits
```
type(scope): brief description

type: feat | fix | docs | refactor | test | chore
```

---

## Part 5: Using the Pipeline (After Integration)

### Start Execution

```bash
curl -X POST http://localhost:8001/api/v1/autonomous/start \
  -H "Content-Type: application/json" \
  -d '{
    "plan_path": "docs/plans/MASTER_PLAN.md",
    "execution_mode": "dagger"
  }'
```

### Monitor Progress

```bash
# Via REST
curl http://localhost:8001/api/v1/autonomous/{execution_id}/status

# Via WebSocket
ws://localhost:8001/ws/autonomous/{execution_id}
```

### Execution Flow

```
Plan → Parse → For each batch:
                  │
                  ├─ Task 1 ──► Worktree ──► PR ──► Review ──► Merge
                  ├─ Task 2 ──► Worktree ──► PR ──► Review ──► Merge
                  └─ Task N ──► Worktree ──► PR ──► Review ──► Merge
                  │
                  ▼
              Next Batch
```

---

## Part 6: Key Services (After Integration)

| Service | Purpose |
|---------|---------|
| `worktree_pool.py` | Manage pool of git worktrees |
| `parallel_orchestrator.py` | Coordinate parallel execution |
| `execution_worker.py` | Worker that processes tasks |
| `task_executor.py` | Execute individual tasks |
| `batch_orchestrator.py` | Manage batch lifecycle |
| `plan_parser.py` | Parse markdown plans |

---

## Quick Reference

| Need | Do This |
|------|---------|
| What to work on | Read `docs/plans/MASTER_PLAN.md` |
| Feature spec | Read `docs/specs/commandcenter3.md` |
| Operations guide | Read `docs/reference/runbook.md` |
| Check skills | `cat skills/<name>/SKILL.md` |

---

*This file is read by all AI agents. Keep it concise and actionable.*
