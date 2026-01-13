---
title: CommandCenter V3 Documentation
type: index
status: active
created: 2026-01-11
updated: 2026-01-12 15:47
owner: daniel
---

# CommandCenter V3 Documentation

## Quick Links

- **[Master Plan](plans/MASTER_PLAN.md)** - THE execution plan (single source of truth)
- **[Spec](specs/commandcenter3.md)** - Complete feature specification
- **[Runbook](reference/runbook.md)** - Operations knowledge

## Directory Structure

```
docs/
├── index.md              # This file
├── specs/                # WHAT to build
│   └── commandcenter3.md # THE spec
├── plans/                # HOW/WHEN to build
│   └── MASTER_PLAN.md    # THE plan (never create new)
└── reference/            # Guides, runbooks
```

## Current Status (2026-01-12 15:47)

| Phase | Status | Description |
|-------|--------|-------------|
| 1-3 | ✅ Complete | Pipeline validation, tests, coverage |
| 4 | ⏳ Blocked | MVP implementation (skill enforcement needed) |
| 5 | ⏳ Pending | Final integration |

## Documentation Rules

1. **ONE MASTER_PLAN.md** - Never create new plans
2. **Timestamps include time** - Format: `YYYY-MM-DD HH:MM`
3. **No dates in filenames** - Use frontmatter only
4. **Update, don't create** - Check existing docs first

See `skills/documentation-protocol/SKILL.md` for full rules.
