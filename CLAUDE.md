# Scalar Design System — working in this repo

This repo is the **design-system layer** for the Scalar product: design tokens
and React components generated from the v1.1 Figma libraries. It is a package,
not an app.

## Before writing any code here

Read **[AI-GUIDE.md](AI-GUIDE.md)**. It is the contract: the 13 hard rules,
decision tables for colour / size / type / component, the full API, and an
anti-pattern list. It applies to code in this repo and to any product UI built
on it.

## Non-negotiables

1. **Token values come from Figma, never from here.** `src/styles/tokens.css` is
   the only hand-maintained token file, and it is transcribed from the live
   library. `src/tokens/tokens.json`, `src/tokens/generated.ts` and
   `docs/tokens.md` are **generated** — never hand-edit them.
2. **`npm run verify` must pass** before any commit. It typechecks and runs the
   token-contract linter, which fails on raw hex, raw px in scaled properties,
   and unresolved `var()` references.
3. **No raw colour or spacing literals in `src/styles/components.css`.** The
   component layer resolves to semantic tokens only. The linter enforces this.
4. **Never consume a `--primitive-*` token in a component.** They have no mode
   and will not respond to the theme.
5. **Chart.js configs take resolved values, never `var(--…)` strings.** Canvas
   cannot read CSS custom properties; `var()` renders transparent. Take values
   off the `ChartTokens` object from `useChartTokens`.

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
| `src/components/` | One folder per Figma page |
| `scripts/lint-tokens.mjs` | The token-contract linter |
| `docs/known-gaps.md` | Inherited gaps that are deliberate — read before "fixing" one |

## Deliberate decisions, not bugs

- `Typography` takes **`variant`**, not `role` — `role` is the DOM attribute.
- `Row-reading` and `Row-input` are merged into one `Row`; the read/edit
  distinction lives on `Cell type`.
- Stacked bars label the **column total**, not each segment. See
  `docs/known-gaps.md`.
- `Chart Frame` is `chartScaffold()`, not a component — with Chart.js the
  scaffold is scale configuration, not drawn geometry.
