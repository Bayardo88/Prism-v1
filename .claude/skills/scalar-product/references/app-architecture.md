# apps/product — architecture

A dependency-free React app (React 18 + `@scalar/design-system`, compiled with
`tsc`, loaded through an import map — no bundler). It is a **prototype of the
whole product**, not production code: data is fixtures, saves are local state.

```
apps/product/
  index.html                 import map + stylesheet; loads build/main.js
  figma-frames.json          manifest of every Figma frame (the coverage contract)
  src/
    main.tsx  App.tsx        hash router → screen from the registry
    router.tsx               useLocation · href(path, state?) · navigate · match · fill
    routes.ts                EVERY route in the product (single source of the IA)
    types.ts                 ScreenDef · ScreenState · ScreenProps
    registry.ts              concatenates screens/*/index.ts in Figma page order
    Catalog.tsx              #/catalog — every screen & state, linked
    data/fixtures.ts         firm, firms, user, companies, formatters (shared names)
    shell/
      AppFrame.tsx           ScalarProvider + navy Primary Menu + body; `openMenu`, `overlay`
      CompanyLayout.tsx      company header + Secondary Menu + Tertiary sub-nav + footer + dock
      PageHeader.tsx         firm-level title + section tabs + actions
      WorkspaceDock.tsx      Notes / Sheets / Documents dock → WorkspaceDrawer
      overlays/              global menus: companies, date, search, notifications, user
    screens/
      p01-home/ … p16-firm-settings/   one folder per Figma page
        index.ts             `export const screens: ScreenDef[]`
        <Screen>.tsx         `({ state, params }: ScreenProps) => JSX`
        data.ts              area-specific demo data (optional)
```

## The model: screen × state

- A **screen** is one route and one component (`ScreenDef`).
- A **state** is one Figma frame of that screen — default view, a menu open, a
  modal, a validation error, a scroll position. `?state=<key>` selects it; the
  first state is the default.
- `#/figma/<node-id>` resolves a Figma frame to its screen + state and redirects.
- `App` remounts the screen when the state changes (`key`), so a screen can
  initialise local UI state from `state` and stay fully interactive:

```tsx
export function IncomeStatement({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [versionOpen, setVersionOpen] = useState(state === 'version-menu');
  …
}
```

## Chrome — pick one, never re-draw it

| Page kind | Wrap in | Example |
|---|---|---|
| Firm-level product area | `AppFrame area="valuations"` + optional `PageHeader` + `PageBody` | Valuations, Waterfalls, Documents, Intelligence |
| Company page | `CompanyLayout company section subNav subNavEnd headerEnd footer dock` | Financials, Cap Table, Company Valuations |
| Settings / admin | `AppFrame area="settings"` + `PageHeader title tabs current actions` | Firm Settings, User Management, Account |

- `AppFrame.openMenu` opens a global menu (`'companies' | 'companies-add' | 'date' |
  'search' | 'notifications' | 'notification-settings' | 'user' | 'user-firm-settings'`).
  The menus are also live on click on every screen.
- `AppFrame.overlay` (and `CompanyLayout.overlay`) draws a screen-level modal,
  drawer or popover above the body.
- `CompanyLayout.dockOpen="notes"` opens the Workspace Drawer on a tab.

## Routes

All in `routes.ts`. Firm routes are strings (`routes.valuations`); company
routes are functions (`routes.company.capTable('abc-co')`). In a `ScreenDef`,
use the pattern: `route: companyPattern(routes.company.capTable)` →
`/companies/:companyId/cap-table/securities`. Link with `href(route, state?)`.

## Rules that are easy to miss

- Only `@scalar/design-system` components and tokens. `npm run lint:tokens`
  scans `apps/product/src` and fails on raw hex, raw px in spacing/sizing, and
  hand-set font sizes. Layout ratios (`fr`, `%`, `flex`) and 1px borders are fine.
- Glyphs: `import { glyphs, Icon }` → `<Icon><glyphs.Plus /></Icon>`. They are
  structural stand-ins; the product icon set (SDS_Main icons) is not in the
  package (known gap).
- Grid cells: `numeric` on every number; `type="input"` = user-entered (blue),
  `type="data"` = sourced/calculated (green); totals `Row type="total"`.
  Column headers stay on one line.
- Charts remount on data change (`key=`) — ChartCanvas only redraws on theme change.
- Shared names/figures come from `data/fixtures.ts` so screens agree.

## Verification commands

```bash
npm run build             # package → dist (only when src/ changed)
npm run build:product     # app → apps/product/build
npm run lint:tokens       # token contract, incl. apps/product/src
npm run product:catalog   # coverage check + regenerate docs/product/screen-catalog.md & screens.json
npm run verify:product    # all three app checks
node scripts/serve.mjs    # http://localhost:4178/apps/product/index.html#/catalog
```
