# VISLZR UI Cohesion Bundle (Canvas + UI primitives)

This bundle standardizes VISLZR/Canvas node styling so the UI feels cohesive:
- Removes dynamic Tailwind class strings (no `bg-${...}` / `border-${...}` runtime classes).
- Introduces a shared `NodeShell` wrapper used by Idea/Hypothesis/Insight/Task/TaskProgress nodes.
- Normalizes InlineHint typography + surfaces to `cc-*` tokens.
- Styles ReactFlow Controls + MiniMap to match your surface language.

## What changed (high level)
- NEW: `Canvas/nodes/NodeShell.tsx`
- UPDATED: `Canvas/nodes/IdeaNode.tsx`
- UPDATED: `Canvas/nodes/HypothesisNode.tsx`
- UPDATED: `Canvas/nodes/InsightNode.tsx`
- UPDATED: `Canvas/nodes/TaskNode.tsx`
- UPDATED: `Canvas/nodes/TaskProgressNode.tsx`
- UPDATED: `Canvas/InlineHint.tsx`
- UPDATED: `Canvas/index.tsx` (Controls/MiniMap styling)

## Apply to repo
1) Identify your repo path that contains VISLZR Canvas, typically one of:
   - `frontend/src/components/Canvas/`
   - `src/components/Canvas/`

2) Copy/merge:
   - `Canvas/` from this bundle → your repo Canvas folder
   - `ui/` from this bundle → your repo UI primitives folder (only if you don't already have equivalents)

3) If your UI primitives already exist:
   - Keep yours; this bundle doesn’t require Button/Badge imports. (InlineHint and nodes use plain elements + cc tokens.)

4) Build/verify:
   - `pnpm lint` (or your lint command)
   - `pnpm dev`
   - Verify nodes render with consistent rounded corners, border weights, and selection ring.

## Notes
- This bundle assumes your design tokens include:
  - `bg-cc-bg`, `bg-cc-surface`, `border-cc-border`, `text-cc-text`, `text-cc-muted`, `bg-cc-accent`
- If any of these tokens differ, update them in `NodeShell.tsx` and `InlineHint.tsx`.

