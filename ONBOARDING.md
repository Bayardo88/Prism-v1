# Scalar Design System — start here

The design tokens and React components for the Scalar product, generated from
the v1.1 Figma libraries. **421 tokens · ~95 components · Light + Dark · three
type modes.**

Pages are built *out of* this. They never re-specify colour, spacing or type.

Repo: `github.com/Bayardo88/Prism-v1`

---

## If you write product code

### 1. Install

```bash
npm install github:Bayardo88/Prism-v1
```

It builds itself on install — no registry, no build step on your side. Pin a tag
for anything you ship: `github:Bayardo88/Prism-v1#v1.1.0`.

### 2. Wrap the app, once

```tsx
import '@scalar/design-system/styles.css';
import { ScalarProvider } from '@scalar/design-system';

<ScalarProvider mode="system" viewport="auto">
  <App />
</ScalarProvider>
```

`mode` is the colour theme. `viewport` selects the **type ramp**, not the
layout.

### 3. Build from the layer

```tsx
import { Button, FormField, Input, DataGrid, Row, Cell, color, space } from '@scalar/design-system';

<FormField label="Discount rate" helperText="As a percentage." state="error">
  <Input placeholder="12.5" />
</FormField>

<Button variant="secondary" tone="negative">Delete valuation</Button>
```

### 4. Tell your agent about it

Paste into your repo's `CLAUDE.md`:

```markdown
## UI

All product UI is built from `@scalar/design-system`. Before writing any
component, read `node_modules/@scalar/design-system/AI-GUIDE.md` — it is the
contract: tokens, decision tables, component API and anti-patterns. Never
hand-write a colour, spacing value or font size.
```

---

## If you design screens

Use the **`/scalar-screen`** skill. It builds a screen as React from this layer,
verifies it, and can push it back into Figma as instances of the published
library.

```
/scalar-screen  cap table page for a portfolio company
```

Install it once:

```bash
git clone https://github.com/Bayardo88/Prism-v1
ln -sfn "$PWD/Prism-v1/.claude/skills/scalar-screen" ~/.claude/skills/scalar-screen
```

What you get back: a working React screen, checked in Light and Dark, plus a
Figma frame assembled from real library components — not a redraw, so it
re-themes and its variants can be swapped.

---

## The nine rules that prevent most mistakes

The full set (R1–R13) is in `AI-GUIDE.md`.

1. **Never use a `--primitive-*` token.** No mode, will not theme.
2. **`space` is gap and padding. `size` is width and height.** Never cross them.
3. **Every filled surface uses its `on*` text token.** `text.primary` on a fill
   is a contrast bug.
4. **`stroke.control` for anything interactive**, `stroke.default` only for
   container edges.
5. **Colour alone never carries meaning.** Status needs words or an icon.
6. **Text floor is 12px.** There is no smaller step.
7. **Never set `letterSpacing`** — the Overline role owns its tracking.
8. **Every interactive control reaches 44px**, except documented dense grid.
9. **PRISM says what a thing *is*** — never whether you may open it.

---

## Before you open a PR

```bash
npm run verify
```

Typecheck plus the token-contract linter. It fails on raw hex, hard-coded
lengths, unresolved `var()` references, and the same violations inside JSX
`style={{ … }}` objects. It is not advisory — a raw `#0268c1` will stop the
build.

---

## Two live blockers

Both are recorded in `docs/known-gaps.md`.

**`cell` and `Header` are UNPUBLISHED in Figma.** They are the atoms of the data
grid. Until they are published, a designer cannot place a data cell or column
header from the library, and a generated data-sheet screen cannot have its grid
filled in Figma. **Code is unaffected** — `Cell`, `ColumnHeader` and `Row` work
normally.

**The chart series ramp has not passed CVD validation.** `Chart/Series 2` and
`3` separate by only ΔE 4.9 under deuteranopia, and Series 3 shares its hex with
`Chart/Negative` in Light. `BarChart` adds direct labels automatically at three
or more series. If you build your own chart, that obligation is yours.

---

## Where to go deeper

| Doc | For |
|---|---|
| `AI-GUIDE.md` | **The contract.** Rules, decision tables, full API, anti-patterns. Read before building. |
| `docs/tokens.md` | Every token, Light and Dark, all three type modes. Generated. |
| `docs/components.md` | Figma → React traceability. |
| `docs/known-gaps.md` | Deliberate gaps. Read before "fixing" one. |
| `examples/screens/CapTable.tsx` | A worked screen. |

## Changing a token

Token values live in Figma, not in this repo.

1. Change it in the v1.1 tokens file and republish.
2. Update `src/styles/tokens.css` to match.
3. `npm run gen:tokens && node scripts/gen-docs.mjs`
4. `npm run verify`

Never hand-edit `tokens.json`, `generated.ts` or `docs/tokens.md` — all three
are regenerated.
