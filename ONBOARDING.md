# Scalar Design System — start here

The design tokens and React components for the Scalar product, generated from
the v1.1 Figma libraries. **487 tokens · 168 Figma components (plus the code-layer and Workboard families) · Light + Dark · three
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

<ScalarProvider mode="light" viewport="auto">
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

Use the **`/scalar-forge`** skill. It builds a screen as React from this layer on
`main`, using the components the way their Storybook stories do, verifies it, and
can push it back into Figma as instances of the published library.

```
/scalar-forge  cap table page for a portfolio company
```

Install it once:

```bash
git clone https://github.com/Bayardo88/Prism-v1
git clone git@github.com:Bayardo88/prism-builder-pro.git
cd prism-builder-pro && ./install.sh
```

What you get back: a working React screen, checked in light mode (R14), plus a
Figma frame assembled from real library components — not a redraw, so it
re-themes and its variants can be swapped.

---

## The ten rules that prevent most mistakes

The full set (R1–R14) is in `AI-GUIDE.md`.

1. **Never use a `--primitive-*` token.** Published but off-limits — use the Semantic tokens only. No mode, will not theme.
2. **`space` is gap and padding. `size` is width and height.** Never cross them.
3. **Every filled surface uses its `on*` text token.** `text.primary` on a fill
   is a contrast bug.
4. **`stroke.control` for anything interactive**, `stroke.default` only for
   container edges.
5. **Colour alone never carries meaning.** Status needs words or an icon.
6. **Text floor is 12px** for anything a user reads. The one step below it is `heading.xs` (10px), for data-grid column headers and in-cell labels only.
7. **Never set `letterSpacing`** — the Overline role owns its tracking.
8. **Every interactive control reaches 44px**, except documented dense grid.
9. **PRISM says what a thing *is*** — never whether you may open it.
10. **Always light mode.** Every page and screen renders in Light, even when the
    machine is set to dark. `ScalarProvider` defaults to `light`; never ship
    `mode="dark"` or follow the OS.

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

**`cell` and `Header` are still UNPUBLISHED in Figma** (checked 2026-10-05, after the rest of the library was published). They are the atoms of the data
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
| [Storybook](https://scalar-prism-storybook.netlify.app) | Every component live, from `main`. Start with **Workboard › Valuation Modal spec** for the Workboard modal. |

## Changing a token

Token values live in Figma, not in this repo.

1. Change it in the v1.1 tokens file and republish.
2. Update `src/styles/tokens.css` to match.
3. `npm run gen:tokens && node scripts/gen-docs.mjs`
4. `npm run verify`

Never hand-edit `tokens.json`, `generated.ts` or `docs/tokens.md` — all three
are regenerated.

## Adding a new token

A new token starts in Figma too. This is how the Deal family (`Deal/*`,
known gap 14) was added, and it is the pattern to follow:

1. **Find the primitive.** A colour a design file calls by another name
   (the workboard file's "Accent") is usually an existing primitive scale
   (Teal). Never put a primitive in a component (R1).
2. **Create the semantic variable** in the tokens file
   (`anrnTIJKgu27zV224h7vON`), collection *Semantic: Color*, as
   `Group/Name` with a Light and a Dark alias to primitive steps. Match the
   existing variables: explicit scopes (fills, text or stroke — never all), a
   `WEB` code syntax of `var(--color-group-name)`, and a description that says
   what it is for, what to pair it with, its contrast and
   "Resolves to: Light = … · Dark = …". The Figma MCP (`use_figma`) can do this.
3. **Give every fill its ink.** A fill without an AA text colour is not a token
   yet (R3, R13). White on Teal 500 is 2.25:1, so Deal pairs it with Teal 900.
4. **Publish the library.**
5. **Transcribe** into `src/styles/tokens.css` (Light and Dark blocks), add the
   group to `src/tokens/index.ts` (`color.<group>`), give it a section in
   `scripts/gen-docs.mjs`, and add its text/fill pairs to
   `scripts/lint-contrast.mjs`. Then `npm run gen:tokens && node scripts/gen-docs.mjs && npm run verify`.
6. **Document it:** a row in AI-GUIDE §2 (the colour railroad), the
   CHANGELOG, and a known-gaps entry while any Figma frame still uses the old
   value.
