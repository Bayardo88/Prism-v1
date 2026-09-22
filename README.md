# Scalar Design System — React layer

The code layer for the Scalar product: **421 design tokens** and **88
components**, generated from the v1.1 Figma libraries, with Light/Dark theming
and a three-mode type ramp.

This package is the single place Scalar product UI gets its colour, type,
spacing and components from. Pages are built *out of* it; they never re-specify
what it already defines.

| | |
|---|---|
| **Tokens (Figma)** | `Scalar_Design_System-v1.1` — [`anrnTIJKgu27zV224h7vON`](https://www.figma.com/design/anrnTIJKgu27zV224h7vON/) |
| **Components (Figma)** | `Scalar_Design_System-Components` — [`Z4MtKOfkNEzhMYJzN1q3kR`](https://www.figma.com/design/Z4MtKOfkNEzhMYJzN1q3kR/) |
| **Icons** | `SDS_Main icons` — a separate library, **not** bundled here |

---

## Install in a product repo

The package builds itself on install, so a git dependency needs no registry:

```bash
npm install github:Bayardo88/Prism-v1
```

Pin a tag or commit for anything you ship:

```bash
npm install github:Bayardo88/Prism-v1#v1.1.0
```

Then tell your agents about it — paste this into the consuming repo's
`CLAUDE.md`:

```markdown
## UI

All product UI is built from `@scalar/design-system`. Before writing any
component, read `node_modules/@scalar/design-system/AI-GUIDE.md` — it is the
contract: tokens, decision tables, component API and anti-patterns. Never
hand-write a colour, spacing value or font size.
```

## Develop this package

```bash
npm install
npm run build
```

```tsx
// Once, at the application entry point:
import '@scalar/design-system/styles.css';
import { ScalarProvider } from '@scalar/design-system';

<ScalarProvider mode="system" viewport="auto">
  <App />
</ScalarProvider>;
```

```tsx
// Anywhere in the app:
import { Button, FormField, Input, Alert, color, space } from '@scalar/design-system';

<FormField label="Discount rate" helperText="As a percentage." state="error">
  <Input placeholder="12.5" />
</FormField>

<Button variant="primary" tone="negative">Delete valuation</Button>
```

---

## Building screens with it

The repo ships a Claude skill, **`scalar-screen`**, that builds a product screen
as React composed from this layer, verifies it, and can push it back into Figma
as instances of the published library.

```
/scalar-screen  cap table page for a portfolio company
```

It lives in `.claude/skills/scalar-screen/`, so it is versioned with the design
system and updates when the system does. To make it available outside this repo:

```bash
ln -sfn "$PWD/.claude/skills/scalar-screen" ~/.claude/skills/scalar-screen
```

## Documentation

| Read this | When |
|---|---|
| **[ONBOARDING.md](ONBOARDING.md)** | **New here?** Install, first component, the nine rules, and the two live blockers. Ten minutes. |
| **[AI-GUIDE.md](AI-GUIDE.md)** | **Start here.** The complete contract: rules, decision tables, component API, anti-patterns. Written to be read by both people and coding agents before building a page. |
| [CLAUDE.md](CLAUDE.md) | Auto-loaded by agents working *on* this package. Points at AI-GUIDE and lists the non-negotiables. |
| [docs/tokens.md](docs/tokens.md) | The full token reference — every colour in Light and Dark, every scale, the type ramp in all three modes. Generated. |
| [docs/components.md](docs/components.md) | Figma → React traceability. Which Figma component set each export came from, and where any two were merged. |
| [docs/known-gaps.md](docs/known-gaps.md) | Inherited gaps that are deliberate, with the reason and the workaround. Read before "fixing" one. |

---

## The short version

Nine rules cover most of what goes wrong. The full set (R1–R13) is in
[AI-GUIDE.md](AI-GUIDE.md).

1. **Never use a `--primitive-*` token.** They have no mode and will not theme.
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

## Project layout

```
src/
  styles/
    tokens.css        ← the source of truth for every token value
    base.css          ← reset, type ramp utilities, focus ring, touch target
    components.css    ← component layer; zero raw hex by construction
  tokens/
    tokens.json       ← generated from tokens.css
    generated.ts      ← generated types + raw values
    index.ts          ← the ergonomic API (color, space, radius, size, type…)
  theme/              ← ScalarProvider: colour mode + type-ramp mode
  components/         ← one folder per Figma page
scripts/
  gen-tokens.mjs      ← tokens.css → tokens.json + generated.ts
  gen-docs.mjs        ← tokens.json → docs/tokens.md
  lint-tokens.mjs     ← token-contract linter
  build-css.mjs       ← bundles the three stylesheets
```

## Scripts

| Command | What it does |
|---|---|
| `npm run verify` | Typecheck **and** token-contract lint. Run before every PR. |
| `npm run build` | Compiles TS to `dist/` and bundles `dist/styles/scalar.css`. |
| `npm run lint:tokens` | Fails on raw hex, raw px in scaled properties, unresolved `var()` references, and the same violations inside JSX `style={{ … }}` objects. |
| `npm run gen:tokens` | Regenerates the TS token layer from `tokens.css`. |
| `npm run typecheck` | `tsc --noEmit`. |

## Changing a token

Token values live in Figma, not here.

1. Change it in the **v1.1 tokens file** and republish the library.
2. Re-extract and update `src/styles/tokens.css`.
3. `npm run gen:tokens && node scripts/gen-docs.mjs`
4. `npm run verify`

Never edit `tokens.json` or `generated.ts` by hand — they are regenerated.

## Styling approach

Plain CSS with custom properties. No CSS-in-JS, no Tailwind. Theming is a
`data-theme` attribute, so switching mode costs nothing and never re-renders a
component tree.

The one runtime dependency is **Chart.js 4**, used by the chart components.
Because canvas cannot read CSS custom properties, charts resolve their tokens to
concrete values and re-resolve them whenever the theme changes — see
`src/components/charts/useChartTokens.ts`. If a route uses no charts, import
from the narrow entry point so Chart.js stays out of that bundle:

```tsx
import { BarChart } from '@scalar/design-system/charts';
```

Component classes are prefixed `scalar-`. To extend a component, pass
`className` — every component forwards it.
