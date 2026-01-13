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

### Skill Checking Protocol

```bash
# P0 - Always check at session start
cat skills/skill-governance/SKILL.md
cat skills/operations/SKILL.md          # Pipeline work

# P1 - Check when relevant
cat skills/patterns/SKILL.md            # Code work
cat skills/repository-hygiene/SKILL.md  # Before commits
cat skills/documentation-protocol/SKILL.md  # Docs changes
cat skills/autonomy/SKILL.md            # Long-running tasks

# P2 - Advisory
cat skills/lessons/SKILL.md             # When debugging
```

---

## Part 1: Execution Modes

### Dagger Pipeline Mode (Recommended for Autonomous Execution)

When `branch` parameter is specified:
1. **Clone** fresh from remote into isolated container
2. **Execute** Claude Code in container
3. **Commit** changes inside container
4. **Push** directly to GitHub from container
5. **No sync** back to host (your local repo unchanged)

**Use for:** Parallel agents, autonomous pipeline, CI/CD

### Dagger Testing Mode

When `branch` parameter is NOT specified:
1. **Mount** local repo into container
2. **Execute** Claude Code
3. **Sync** changes back to host

**Use for:** Development iteration, quick tests

### Local Mode

Direct execution on host machine using Claude Max OAuth.

**Use for:** Single quick tasks, debugging

### Comparison

| Mode | Cost | Parallel | Isolation | Local Changes |
|------|------|----------|-----------|---------------|
| `local` | FREE | ❌ | ❌ | ✅ |
| `dagger` (pipeline) | FREE | ✅ | ✅ | ❌ |
| `dagger` (testing) | FREE | ❌ | ❌ | ✅ |

---

## Part 2: Document Management

### Directory Structure

```
project-root/
├── CLAUDE.md              # Claude Code entry point
├── AGENTS.md              # This file
├── README.md              # Human-facing overview
├── NEXT_STEPS.md          # Current priorities
├── docs/
│   ├── specs/
│   │   └── commandcenter3.md  # THE source of truth
│   └── plans/
│       └── MASTER_PLAN.md     # Master execution plan
└── skills/                    # Project skills
```

### File Naming

| Rule | Correct | Incorrect |
|------|---------|-----------|
| Lowercase kebab-case | `memory-system.md` | `Memory_System.md` |
| No dates in filename | `memory-system.md` | `2026-01-05-memory.md` |

---

## Part 3: Coding Standards

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

## Part 4: Using the Pipeline

### Start Execution

```bash
curl -X POST http://localhost:8001/api/v1/autonomous/start \
  -H "Content-Type: application/json" \
  -d '{
    "plan_path": "docs/plans/supervised-test-plan.md",
    "execution_mode": "dagger"
  }'
```

### Monitor Progress

```bash
# Via WebSocket
ws://localhost:8001/ws/autonomous/{execution_id}

# Via REST
curl http://localhost:8001/api/v1/autonomous/{execution_id}/status
```

### Execution Flow

```
Plan → Parse → For each batch:
                  │
                  ├─ Task 1 ──► Container ──► PR ──► Review ──► Merge
                  ├─ Task 2 ──► Container ──► PR ──► Review ──► Merge
                  └─ Task N ──► Container ──► PR ──► Review ──► Merge
                  │
                  ▼
              Next Batch
```

---

## Part 5: Key Services

| Service | Purpose |
|---------|---------|
| `agent_service.py` | Execute agents (local/dagger) |
| `batch_orchestrator.py` | Manage batch lifecycle |
| `task_executor.py` | Task → PR → Review → Merge |
| `plan_parser.py` | Parse markdown plans |
| `pr_reviewer.py` | Automated code review |
| `fix_agent.py` | Apply review feedback |
| `merge_manager.py` | Merge PRs + cleanup |

---

## Part 6: Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Health check |
| `POST /api/v1/autonomous/start` | Start pipeline |
| `GET /api/v1/autonomous/{id}/status` | Get status |
| `POST /api/v1/agents/run` | Run single agent |
| `POST /api/v1/chat/stream` | Chat with context |

---

## Quick Reference

| Need | Do This |
|------|---------|
| What to work on | Read `NEXT_STEPS.md` |
| Current plan | Read `docs/plans/MASTER_PLAN.md` |
| Feature spec | Read `docs/specs/commandcenter3.md` |
| Run pipeline | `curl -X POST .../autonomous/start` |
| Check skills | `cat skills/<name>/SKILL.md` |

---

*This file is read by all AI agents. Keep it concise and actionable.*
