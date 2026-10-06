# Getting started

Five minutes from `npm install` to a screen on the page.

## 1. Install

```bash
npm install github:Bayardo88/Prism-v1#v1.1.0     # pin a tag; the package builds itself on install
```
Peer dependencies: `react` and `react-dom` ≥ 18. Charts additionally use `chart.js` (bundled as a dependency).

## 2. Load the styles once

```tsx
// main.tsx (Vite) · app/layout.tsx (Next.js) · index.tsx (CRA)
import '@scalar/design-system/styles.css';
```

## 3. Wrap the app

```tsx
import { ScalarProvider } from '@scalar/design-system';

createRoot(document.getElementById('root')!).render(
  <ScalarProvider mode="light" viewport="auto">
    <App />
  </ScalarProvider>,
);
```
Pages are always light mode (rule R14). `viewport="auto"` follows the window width and is safe during server rendering.

## 4. Build a screen

Start from `PageTemplate` — it gives you the navigation, a body slot and the docked drawer. See `docs/page-template.md`.

```tsx
import { Button, Card } from '@scalar/design-system';

export function Example() {
  return (
    <Card title="Valuations" headingLevel={2}>
      <Button onClick={save}>Save</Button>
    </Card>
  );
}
```

## Recipes

**Router links that look like buttons** — every component that renders a trigger supports `asChild`:
```tsx
import { Link } from 'react-router-dom';          // or next/link
<Button asChild><Link to="/valuations">Valuations</Link></Button>
```

**Refs, test ids, aria, classes work everywhere** — every component forwards `ref` and spreads native props onto its root:
```tsx
const ref = useRef<HTMLButtonElement>(null);
<Button ref={ref} data-testid="save" aria-describedby="hint" className="my-extra">Save</Button>
```

**Forms** — inputs wire label, hint and error for you:
```tsx
<FormField
  label="Email"
  helperText={errors.email ? 'Enter a valid address, like name@company.com' : 'We never share it'}
  state={errors.email ? 'error' : 'default'}
  required
>
  <Input type="email" {...register('email')} />
</FormField>
```
Inputs work controlled (`value` / `onChange`) and uncontrolled (`defaultValue`), so they fit react-hook-form, Formik or plain state.

**Dialogs** — `Modal` traps focus, closes on Escape and returns focus to the opener. Pass `onClose`; an inline arrow is fine.

**Server rendering (Next.js)** — components don't touch `window` during render and ids come from `useId`, so SSR hydrates cleanly. Import the stylesheet in the root layout.

**Charts** — Chart.js configs take resolved values, never `var(--…)`: use `useChartTokens`. Charts redraw when their data changes and ship a hidden data table for screen readers.

**Tailwind** — the components are plain CSS classes (`scalar-*`) driven by CSS variables, so they coexist with Tailwind. Use the token CSS variables in your own utilities (`bg-[var(--color-background-surface)]`); never use `--primitive-*`.

## Commands

| | |
|---|---|
| `npm run verify` | typecheck · token lint · ESLint (hooks + a11y) · tests |
| `npm test` | Vitest + Testing Library + axe |
| `npm run playground` | build and serve the examples |
| `npm run product` | build and serve the product prototype |

## Where next
`AI-GUIDE.md` (the rules) · `docs/component-contract.md` (how components are built) · `docs/components.md` (catalogue) · `CONTRIBUTING.md`.
