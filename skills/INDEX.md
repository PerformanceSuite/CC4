# Skills Index

> **Last Updated:** 2026-01-12 15:47

CommandCenter V3 skills - consolidated for efficiency.

## Active Skills (10)

| Skill | Priority | Purpose |
|-------|----------|---------|
| [skill-governance](skill-governance/SKILL.md) | P0 | Skill lifecycle, archival decisions |
| [damage-control](damage-control/SKILL.md) | P0 | Safety hooks, block destructive commands |
| [context-management](context-management/SKILL.md) | P0 | Stay under 50% context |
| [operations](operations/SKILL.md) | P0 | Pipeline, dagger, startup |
| [lessons](lessons/SKILL.md) | P0 | **CHECK FIRST** - Anti-patterns, incidents |
| [patterns](patterns/SKILL.md) | P1 | Code patterns - frontend, agents |
| [repository-hygiene](repository-hygiene/SKILL.md) | P1 | File placement, no root clutter |
| [documentation-protocol](documentation-protocol/SKILL.md) | P1 | Doc structure, naming, timestamps |
| [autonomy](autonomy/SKILL.md) | P1 | Ralph loops, long-running tasks |
| [cc3-autonomous-pipeline](cc3-autonomous-pipeline/SKILL.md) | P1 | Pipeline-specific operations |

## Quick Reference

- **Session start:** Check `lessons` for recent issues
- **Pipeline/agent work:** Read `operations`
- **Creating files:** Read `repository-hygiene`
- **Docs changes:** Read `documentation-protocol`

## CRITICAL: Skills Being Ignored

Skills are frequently ignored without enforcement. See `lessons/SKILL.md` → "Skills Being Ignored" incident for the fix.

**Key violations:**
- Creating new plans instead of updating MASTER_PLAN.md
- Dates in filenames instead of frontmatter
- Test scripts in project root
- Missing timestamps in updated fields

## Archived Skills

Old skills preserved in `archive/` for reference. Not auto-loaded.
