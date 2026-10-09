# Scalar Design System — working in this repo

This repo is the **design-system layer** for the Scalar product: design tokens
and React components generated from the v1.1 Figma libraries. It is a package,
not an app.

## Before writing any code here

Read **[AI-GUIDE.md](AI-GUIDE.md)**. It is the contract: the 13 hard rules,
decision tables for colour / size / type / component, the full API, and an
anti-pattern list. It applies to code in this repo and to any product UI built
on it.

## Building a screen

Every screen starts from `PageTemplate` — navigation, a body slot for your
content, and the docked drawer. Read **[docs/page-template.md](docs/page-template.md)**
(§6 is the agent rules) before writing one. Never assemble the chrome by hand.

## Non-negotiables

1. **Token values come from Figma, never from here.** `src/styles/tokens.css` is
   the only hand-maintained token file, and it is transcribed from the live
   library. `src/tokens/tokens.json`, `src/tokens/generated.ts` and
   `docs/tokens.md` are **generated** — never hand-edit them.
2. **`npm run verify` must pass** before any commit. It typechecks, runs ESLint
   (React-hooks and jsx-a11y rules are errors), runs the test suite, and runs the
   token-contract linter, which fails on raw hex, raw px in scaled properties,
   unresolved `var()` references, and contract violations inside JSX
   `style={{ … }}` objects — including type set from a sizing token, and the
   `space` / `size` scales being crossed.
3. **No raw colour or spacing literals in `src/styles/components.css`.** The
   component layer resolves to semantic tokens only. The linter enforces this.
4. **Never consume a `--primitive-*` token in a component.** The primitive
   collections are published in Figma but are off-limits to developers and AI
   agents — only the Semantic collections are for use. They have no mode and
   will not respond to the theme.
5. **Pages are always light mode**, even when the machine is set to dark.
   `ScalarProvider` defaults to `light`; never ship `mode="dark"` or follow the
   OS (rule R14 in AI-GUIDE).
6. **Chart.js configs take resolved values, never `var(--…)` strings.** Canvas
   cannot read CSS custom properties; `var()` renders transparent. Take values
   off the `ChartTokens` object from `useChartTokens`.

## Building a component

Every component follows **[docs/component-contract.md](docs/component-contract.md)**:
`forwardRef`, native props with `...rest`, merged `className`, exported props type,
`asChild` on triggers, and the keyboard model for any ARIA role it declares
(built from `useOverlay` / `useRovingFocus` / `Slot` in `src/utils`). A new or
changed component needs a test (axe + keyboard + ref/className passthrough) and a
story. Commands: `npm test` · `npm run lint` · `npm run storybook`.

## Changing a token

Change it in Figma and republish, then:

```bash
# 1. update src/styles/tokens.css to match the live library
npm run gen:tokens          # -> tokens.json + generated.ts
node scripts/gen-docs.mjs   # -> docs/tokens.md
npm run verify
```

## Layout

| Path | What it is |
|---|---|
| `src/styles/tokens.css` | Source of truth for every token value in code |
| `src/styles/components.css` | Component layer, zero raw hex by construction |
| `src/tokens/` | Generated TS token API |
| `src/components/` | One folder per Figma page — each with `*.test.tsx` and `*.stories.tsx` |
| `src/utils/` | Shared primitives: `Slot`, `useOverlay`, `useRovingFocus`, `useFieldIds`, … |
| `docs/decisions/` | Architecture decisions (why in-house hooks, not Radix) |
| `scripts/lint-tokens.mjs` | The token-contract linter |
| `docs/navigation-3-tier-system.md` | The 3-tier navigation spec: tier scope, layout, per-screen configuration, rules. Read before building or editing any screen's nav chrome |
| `docs/known-gaps.md` | Inherited gaps that are deliberate — read before "fixing" one |
| `apps/product/` | The full Scalar product as a prototype — every Scalar-full-product Figma frame. Change it with the `scalar-product` skill; `npm run verify:product` must pass |

## Deliberate decisions, not bugs

- `Typography` takes **`variant`**, not `role` — `role` is the DOM attribute.
- `Row-reading` and `Row-input` are merged into one `Row`; the read/edit
  distinction lives on `Cell type`.
- Stacked bars label the **column total**, not each segment. See
  `docs/known-gaps.md`.
- `Chart Frame` is `chartScaffold()`, not a component — with Chart.js the
  scaffold is scale configuration, not drawn geometry.
