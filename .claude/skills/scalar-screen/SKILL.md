---
name: scalar-screen
description: Build a standalone Scalar screen as React (examples/screens), composed entirely from the Scalar Design System layer, then optionally push it back into Figma. Use for one-off screens outside the product app. For creating, editing or prototyping pages of the Scalar product itself (apps/product), use the scalar-product skill instead.
---

# Scalar Screen Builder

Build a screen out of the **Scalar Design System** (`@scalar/design-system`,
v1.1). The layer already encodes every rule — the job here is to *compose* it,
never to re-specify it.

---

## Step 1 — Load the contract. Do not skip this.

Read **`AI-GUIDE.md`** before writing a line. It holds the 13 hard rules, the
decision tables for colour / size / type / component, the full API and the
anti-pattern list.

Find it in this order:

| Where you are | Path |
|---|---|
| In the design-system repo | `./AI-GUIDE.md` |
| In a product repo | `node_modules/@scalar/design-system/AI-GUIDE.md` |
| Neither | `npm install github:Bayardo88/Prism-v1` first |

If the package is not installed and cannot be, **stop and say so.** Do not
approximate the design system from memory or from an old mockup — that is how
drift starts.

Also skim `docs/known-gaps.md`. Several gaps change what you are allowed to
build (charts, dense grids, icons).

## Step 2 — Name the archetype before composing

Most Scalar screens are one of six shapes. Read
[references/screen-recipes.md](references/screen-recipes.md) and pick one; it
lists the components each is built from and the traps specific to it.

`data-sheet` · `dashboard` · `detail` · `form` · `list-search` · `empty-or-error`

State which archetype you picked and why, in one line, before writing code.

## Step 3 — Compose, never hand-roll

Start from `PageTemplate` (`@scalar/design-system`): pass `navigation`,
`companyInfo`, `subNavigation` and `drawer`, and put your screen in `children` —
the body slot. Do not hand-assemble the chrome. See `docs/page-template.md` §6.

The layer exports ~95 components. Before writing any element, check whether one
exists — the decision table in AI-GUIDE §5 maps intent to component.

```tsx
import {
  ScalarProvider, PrimaryMenu, MainMenuItem, CompanyInfo,
  SecondaryMenu, SecondaryMenuItem, DataGrid, Row, Cell, ColumnHeader,
  Button, FormField, Input, Alert, color, space,
} from '@scalar/design-system';
```

Hard limits while composing:

- **No raw hex, no raw px, no hand-set font sizes.** Colour from `color.*`,
  gap and padding from `space.*`, width and height from `size.*`, type from a
  `Typography` component or `type.style()`.
- **No new component.** If nothing fits, say so and propose the addition rather
  than inventing a one-off in the screen.
- **Icons come from `SDS_Main icons`**, exported and passed to `Icon`. The
  glyphs in `glyphs.tsx` are structural only and are not the product icon set.
- **Layout is yours; everything inside it is the system's.** Page-level grid and
  flex are fine — they just take `space.*` values.

## Step 4 — Verify before you claim it works

```bash
npm run verify     # typecheck + token-contract lint
```

Then actually look at it. Render the screen and check, in this order:

1. It renders with no console errors.
2. **Light mode only (R14).** The page must render light even when the OS is in
   dark mode — emulate OS dark and confirm nothing changes. Never ship
   `mode="dark"`.
3. Focus is visible on every interactive control.
4. Nothing is below 12px.
5. Charts with three or more series carry direct labels.

Report what you checked. If you did not render it, say that plainly.

## Step 5 — Push it back into Figma (code → design)

Only after the screen renders correctly. This gives design a frame to react to
rather than a description.

Load the `figma-generate-design` and `figma-use` skills, then follow
[references/figma-push.md](references/figma-push.md). The short version:
**import the published v1.1 library components and assemble from instances** —
never redraw the UI as rectangles and text, which produces a picture of a
screen rather than a screen.

Ask before writing to a shared Figma file, and say which file and page you are
writing to.

---

## Refuse to

- Build against any token name that is not in `AI-GUIDE.md`.
- Copy an existing mockup's colours or type sizes. Take both from the contract,
  never from a screen.
- Colour a Global Search result by anything other than its PRISM type — and
  never use PRISM to signal access or permission.
- Use `text.primary` on a filled surface, or white on `bg.warning`.
- Ship a chart without a legend, or a canvas chart without its data table.
