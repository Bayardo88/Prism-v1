# Component contract

Every component in `src/components` follows this shape. It is what makes the package plug-and-play: a developer can
attach a ref, a `data-testid`, an `aria-*` attribute, an event handler or a class to **any** component and it lands on the
element they expect.

## 1. The shape

```tsx
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

export type BadgeTone = 'neutral' | 'positive' | 'negative';          // string-literal unions, exported

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { // native props of the root element
  tone?: BadgeTone;                                                   // JSDoc every prop
  children?: ReactNode;
}

/** One-line description. Figma node. Tokens used. Accessibility notes. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', className, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx('scalar-badge', `scalar-badge--${tone}`, className)} {...rest}>
      {children}
    </span>
  );
});
```

Rules
1. **`forwardRef`** to the root element — or to the interactive element when the root is a wrapper (Input → the `<input>`).
2. **Extend the native props** of that element and spread `...rest` **after** your own attributes only when the consumer must be
   able to override them; spread **before** attributes the component must own (e.g. `role`, `aria-modal`).
3. **`className` is merged** with `cx`, never replaced.
4. **Export the props type** (`XProps`) and every variant union from the folder `index.ts`.
5. Variants, sizes and tones are **string-literal unions**, never `string`. Interaction states are CSS pseudo-classes, not props.
6. **No raw values:** colours/spacing/type come from tokens (`npm run lint:tokens` enforces it).
7. Components are defined at module top level. No refs written during render. No `window`/`document` access during render.
8. Ids come from `useId` (via `useFieldIds`), never `Math.random()` or counters.

## 2. Accessibility is part of the API

- **Name required by the compiler.** Where there may be no visible text, encode it in the type:
  `type IconOnly = { 'aria-label': string } | { 'aria-labelledby': string }`.
- Use the native element (`<button>`, `<a>`, `<table>`, `<label>`, `<ul>`) before reaching for `role`.
- A declared `role` means the APG keyboard model for it **is implemented** and tested:

| Role | Keyboard (use) |
|---|---|
| `dialog` | `useOverlay({ modal })` — focus in, trap (modal), Esc, focus return |
| `menu` / `menuitem*` | `useRovingFocus({ orientation: 'vertical', typeahead })`, Esc closes, Tab closes |
| `tablist` / `tab` | `useRovingFocus({ orientation: 'horizontal' })`, Home/End, `aria-controls` ↔ `aria-labelledby` |
| `listbox` / `option` | roving or `aria-activedescendant`, type-ahead |
| `grid` / `treegrid` | one tab stop, arrows between cells — **or use `role="table"` if cells are not editable** |
| `tree` / `treeitem` | Up/Down/Left/Right/Home/End, `aria-expanded`, `aria-level/setsize/posinset` |

- Form controls: label ↔ control via `useFieldIds`; `aria-invalid`, `aria-describedby={describedBy(hintId, errorId)}`, `required`.
- Status changes (toast, alert, loading) are announced: `role="status"` / `role="alert"` / `aria-live`, `aria-busy`.
- Focus is always visible: use `:focus-visible` with the focus-ring token; never `outline: none` without a replacement.
- Respect `prefers-reduced-motion` (global rule in `base.css`; don't override it with `!important`).
- Decorative icons are `aria-hidden`; informative ones carry a label.

## 3. `asChild`

Components that render a trigger (Button, Link, Chip, Card, MenuItem, Tooltip/Popover triggers) accept `asChild`:

```tsx
<Button asChild><NextLink href="/valuations">Valuations</NextLink></Button>
```
It renders the child element with the component's classes, props and ref merged on (`Slot` in `src/utils`).

## 4. Tests (required)

Each component folder has a `*.test.tsx` that checks, at minimum:
- renders with required props and has **no axe violations** (`checkA11y`)
- forwards `ref`, merges `className`, passes `data-testid` through
- every keyboard behaviour its role promises (use `userEvent.keyboard`)

Run: `npm test` · `npm run lint` · `npm run verify`.

## 5. Shared primitives (`src/utils`)

| Primitive | Use |
|---|---|
| `Slot`, `AsChildProps` | `asChild` |
| `composeRefs`, `setRef` | forward a consumer ref and keep an internal one |
| `useOverlay` | dialogs, drawers, popovers, menus |
| `useRovingFocus` | tabs, menus, toolbars, segmented controls, listboxes |
| `useFieldIds`, `describedBy` | label / hint / error wiring |
| `useControllableState` | `value` / `defaultValue` / `onChange` |
| `useEvent`, `useLatestRef` | stable callbacks; read latest props from effects without re-running them |
| `VisuallyHidden`, `getFocusable` | SR-only text; tabbable query |
