# Reuse ladder — the gate before anything new

Every visual or structural decision goes down this ladder. **Stop at the first
rung that works.** You may only go to the next rung by writing down, in one line,
why the rung above cannot do it. "It would look nicer" is not a reason;
"the feature needs X and rung N has no X" is.

Run `node .claude/skills/scalar-product/scripts/reuse-check.mjs <keywords>` first.
Try 2–3 synonyms before concluding something doesn't exist.

| # | Rung | Test | Where to look |
|---|---|---|---|
| 1 | **An existing screen/state already does it** | Same job, different data? | `docs/product/screens.json`, `screen-catalog.md` |
| 2 | **Compose existing screens' inner pieces** | Import them; don't redraw | the screen's folder in `apps/product/src/screens/` |
| 3 | **A platform-chrome slot** (`AppFrame`, `CompanyLayout`, `PageHeader`, `overlay`, `dock`) | Is it a page frame, menu, modal or drawer? | `shell/` |
| 4 | **An existing DS component, its props/variants** | Intent → component table | `AI-GUIDE.md` §5, §7; `docs/components.md` |
| 5 | **A composition of existing DS components** | Layout out of `Stack`/`Grid`-type primitives + tokens only | `AI-GUIDE.md` §3 (space/size) |
| 6 | **A new screen-local layout** (a `<div>` arrangement of DS parts, tokens only) | Only if 1–5 fail; lives in the screen folder | — |
| 7 | **A new DS component / token / chrome pattern** | Only if the *feature* requires behaviour no composition gives | **Propose, don't build** (below) |

## What counts as "the feature requests it"

New layout / component is justified **only** when at least one is true:
- The feature has an interaction with no equivalent (e.g. drag-to-reorder, a board/kanban, a timeline scrubber) — confirmed by `reuse-check` and AI-GUIDE §5.
- The information architecture genuinely changes (a new top-level area, a new scope).
- The requested data shape doesn't fit any grid/list/form archetype.

These are **not** reasons: matching a competitor's look, a screenshot the user
pasted that uses different styling (the DS wins — AI-GUIDE overrides screenshots),
"a slightly different padding", "a custom card", one-off colours.

## Never, at any rung

- A raw hex, rgb, px in spacing/sizing, or hand-set font size — `npm run lint:tokens` fails them. Use `color.*`, `space.*`, `size.*`, `type.style()`.
- A `--primitive-*` token in product code (R1). Only semantic tokens.
- Text below 12px (R10). PRISM colours for anything but entity type (R11).
- An HTML `<table>` (use `DataGrid`), a `Button` that navigates (use `Link`), `window.confirm` (use `ConfirmationDialog`).
- A hard-coded company/user list — use `db`, `fixtures.ts`.
- Silently "fixing" something in `docs/known-gaps.md` — those are deliberate.

## Rung 7 protocol — when something new IS needed

1. **State the gap** in ≤3 lines: what the feature needs, which rungs 1–6 you tried, why each failed.
2. **Ask the user** before building it (it changes the shared design system, not just a screen).
3. If approved, build the *smallest* thing:
   - **Screen-local first** (rung 6) — a tokens-only composition inside the screen folder, named for what it is. Promote to `src/components/` only if a second screen needs it.
   - **New token**: edit `src/styles/tokens.css` → `npm run gen:tokens` → `node scripts/gen-docs.mjs` → add to `src/tokens/index.ts` **by hand**. Semantic, never primitive; give both Light and Dark values.
   - **New DS component**: `src/components/<family>/`, follow the neighbouring component's file shape, export from the family `index.ts`, add a row to `docs/components.md` marked **＋** (code-layer only), document props in `AI-GUIDE.md` §7.
4. **Log it**: add the gap and your choice to the screen's `docs/product/pages/NN-*.md` "Gaps" section so design can adopt it in Figma (Figma is the source; code-only additions are debt until then).
5. `npm run verify:product` must stay green.

## Quick anti-drift table

| Temptation | Do instead |
|---|---|
| Copy the Cap Table grid and tweak | import/compose its cells; use `DataGrid` + grid-pattern cells |
| Make a "stat card" | `SummaryCard` family (`docs/components.md` §13) |
| Build a custom empty/loading/error block | `EmptyState`, `Skeleton`, `Alert`/`Banner`, feedback patterns (§14, §24) |
| Custom filter bar | `FilterDropdown`, `Chip`, `ViewTabBar` |
| A bespoke side panel | `Drawer` / Workspace Drawer / overlays (§25) |
| Invent a settings form | Form Patterns (§21) + Settings & Admin (§26) |
