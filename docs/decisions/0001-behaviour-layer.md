# 0001 · Behaviour layer: in-house hooks, no Radix

**Status:** accepted (2026-10-06) · **Context:** code audit `Scalar-DS-Code-Audit.pdf`, task D-1.

## Decision
Interactive behaviour (focus management, roving focus, dismissal, polymorphism) is implemented with small in-house
primitives in `src/utils/` — `useOverlay`, `useRovingFocus`, `Slot`/`asChild`, `useFieldIds`, `useEvent` — instead of
adding `@radix-ui/*` as runtime dependencies.

## Why
- The package is `react >=18` with **zero runtime deps except chart.js**; Radix would add ~10 peer packages and a
  second source of DOM structure that every `scalar-*` CSS selector would have to be re-checked against.
- Most gaps are keyboard/focus gaps on components that already have the right markup and styling. Adding hooks closes
  them without changing the DOM.
- Radix has no equivalent for grid, tree, date picker or combobox, so in-house code was needed there regardless.

## Consequences
- We own the keyboard logic, so every widget has a keyboard test (`user-event`) written against the WAI-ARIA APG pattern.
- `Slot` is ~40 lines and API-compatible with Radix's `asChild`, so swapping to Radix later is a local change.
- Revisit if the team needs behaviour we don't have (e.g. virtualised listbox, nested submenus with safe-triangle).

## Also decided
- **D-2:** keep `forwardRef` (works on React 18 and 19) rather than React 19's ref-as-prop.
