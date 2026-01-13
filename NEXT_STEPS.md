# Next Steps - CommandCenter V3

> **Last Updated:** 2026-01-13 10:40
> **Source of Truth:** This file defines current priorities

---

## #1 PRIORITY: LOCAL MODE GIT CORRUPTION BUG (P0 CRITICAL)

**Status:** 🔴 CRITICAL - LOCAL MODE UNSAFE FOR PRODUCTION
**Discovered:** 2026-01-13 E2E Testing Session
**Impact:** Multi-task batches corrupt git repository (55 empty objects, broken refs)

### Issue Summary

Local mode has a **critical P0 bug** that corrupts the git repository when executing multi-task batches:

**Evidence:**
- Test 1 (1 task, local): ✅ SUCCESS
- Test 2 (2 tasks, local): ❌ FAILED - Git corruption + DB readonly
- Tests 1-3 (Dagger mode): ✅✅✅ ALL PASSED (100% success, no corruption)

**Root Cause:** Concurrent/sequential git operations without locking in local mode

**Immediate Action Required:**
1. ✅ Switch to Dagger mode (validated - 3/3 tests passed)
2. ❌ Document bug in lessons learned
3. ❌ Update CLAUDE.md to warn against local mode
4. ❌ Fix PR creation logic in Dagger mode
5. ❌ Either fix local mode git locking OR deprecate it entirely

---

## #2 PRIORITY: COMPLETE E2E VALIDATION (DAGGER MODE)

**Status:** PARTIALLY COMPLETE (3/10 tests passed)
**Mode:** Dagger only (local mode disabled due to P0 bug)
**Requirement:** 10 consecutive successful Dagger runs before feature development

### Why This Matters

The autonomous pipeline has consumed 100+ hours of debugging. We will NOT proceed with feature development until the pipeline is:
1. **Proven reliable** - 10 consecutive successful runs minimum
2. **Thoroughly documented** - Every variant tested and recorded
3. **Bulletproof** - Error handling, recovery, and edge cases validated

### Test Variants Required (Minimum 10 Runs)

| Test # | Mode | Tasks | Scenario | Expected Result |
|--------|------|-------|----------|-----------------|
| 1 | local | 1 | Simple file creation | PR created, merged |
| 2 | local | 2 | Sequential tasks | Both PRs, correct order |
| 3 | dagger | 1 | Single task in container | PR created from container |
| 4 | dagger | 3 | Parallel execution | All 3 PRs, parallel logs |
| 5 | local | 1 | Task with test file | Tests pass, PR created |
| 6 | local | 1 | Error in task | Graceful failure, status updated |
| 7 | dagger | 2 | Mixed success/failure | One succeeds, one fails gracefully |
| 8 | local | 1 | Already-completed task | Skipped or marked complete |
| 9 | dagger | 1 | Large file creation | Handles >500 lines |
| 10 | local | 1 | Multi-file task | Creates 2+ files, single PR |

### Success Criteria for Each Run

- [ ] Session starts without errors
- [ ] Tasks transition: pending → in_progress → completed
- [ ] Branch created and pushed
- [ ] PR created with correct content
- [ ] PR review posted (or skipped if own PR)
- [ ] PR merged or ready for merge
- [ ] Status API reflects correct state at all times
- [ ] No orphan branches or stale state

### Commands

```bash
# Start backend (NO --reload!)
cd backend && source .venv/bin/activate && uvicorn app.main:app --port 8001

# Run E2E test
curl -X POST http://localhost:8001/api/v1/autonomous/start \
  -H "Content-Type: application/json" \
  -d '{"plan_path": "/Users/danielconnolly/Projects/CommandCenterV3/docs/specs/e2e-test.md", "execution_mode": "local"}'

# Check status
curl -s http://localhost:8001/api/v1/autonomous/{execution_id}/batches | python3 -m json.tool
```

### Recording Results

After each test, document in `docs/specs/e2e-test.md`:
```markdown
## Test Run Log

### Run #1 - 2026-01-13 08:45
- **Mode:** local
- **Duration:** 2m 34s
- **Result:** PASS/FAIL
- **Notes:** [Any issues observed]
```

---

## P0: Pipeline Architecture (After E2E Validation)

Only proceed here after 10+ successful E2E runs.

### Current State
- 1746+ backend tests passing
- Dagger execution with OAuth (FREE)
- Local mode works but sequential

### Known Issues to Fix
1. Dagger mode completes too fast (not waiting for container)
2. Session object reference may not be shared correctly
3. Verification scope runs on entire codebase instead of changed files

---

## P1: Agent Ecosystem Enhancement

After pipeline is validated, enhance agent patterns based on research:

### Orchestration Patterns (from Anthropic/Microsoft/OpenAI research)
1. **Sequential** - Prompt chaining, progressive refinement
2. **Concurrent/Parallel** - Fan-out/fan-in, sectioning, voting
3. **Orchestrator-Workers** - Manager delegates to specialized agents
4. **Evaluator-Optimizer** - Maker-checker loops, iterative refinement
5. **Handoff** - Dynamic delegation between peers
6. **Magentic** - Open-ended task ledger building

### Implementation Priority
1. Ensure single-agent with tools works perfectly first
2. Add parallelization only when proven necessary
3. Document every pattern in skills/patterns/SKILL.md

---

## Architecture Decision

After E2E validation, decide:
- **Option A:** Fix current asyncio-based local execution
- **Option B:** Always use Dagger (isolated containers, cleaner)
- **Option C:** Redesign with proper task queue (Celery, etc.)

**Decision deferred until pipeline proven reliable.**

---

## Quick Reference

| Document | Purpose |
|----------|---------|
| `docs/specs/commandcenter3.md` | Complete feature specification |
| `docs/plans/MASTER_PLAN.md` | Current execution plan |
| `docs/specs/e2e-test.md` | E2E test specification and logs |
| `skills/patterns/SKILL.md` | Agent orchestration patterns |
| `skills/lessons/SKILL.md` | Hard-won debugging lessons |

---

*Nothing else matters until the pipeline works 10 times in a row.*
