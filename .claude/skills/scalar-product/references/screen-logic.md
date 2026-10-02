# Screen logic — how to turn a feature request into a working screen

The design system documents *what things look like*; `docs/product/pages/*.md`
documents *how the product behaves*. Reuse both. Before writing JSX, produce this
**screen brief** (in your reply, 8–12 lines) — it's the "logic" the code follows.

## 1. Screen brief (fill every line)

1. **Job**: one sentence — who does what with which data (copy the phrasing style of `screens.json` `summary`).
2. **Scope & chrome**: firm / company / settings → `AppFrame`, `CompanyLayout` or settings `AppFrame` (see app-architecture.md).
3. **Archetype**: pick the nearest existing one (table below) and name the screen you copy structure from.
4. **Route + entry points**: URL in `routes.ts`; the menu item/tab/row link that reaches it; where "back/out" goes.
5. **Data**: which `db` / `fixtures.ts` records; derived values and their formulas (write the formula, as the page docs do).
6. **Inputs vs calculated**: what the user edits (`type="input"`, blue) vs derived (`type="data"`, green).
7. **States** (each becomes a `ScreenState`): default · empty · loading (`Skeleton`) · error/validation · each open menu/modal/drawer · saved/confirmation.
8. **Actions & outcomes**: every button/link → what changes (local state), where it navigates, what feedback (`Toast` after, `Alert` while, `ConfirmationDialog` before destructive).
9. **Rules**: permissions, mutual exclusion ("only one blank column"), limits, defaults — as bullets like the page docs' "Behaviour & rules".
10. **Reuse verdict**: components used (all from DS), new pieces = none / rung-7 request.

## 2. Archetypes → reference screen → logic to inherit

| Archetype | Copy structure from | Logic to inherit |
|---|---|---|
| Firm portfolio grid | `p03-valuations`, `p04-waterfalls` | `DataGrid` + `Row`, paginate (25, rows-per-page) or `ShowMoreRow`; company picker via `db.companies.search`; date/currency selectors in header |
| Company financial/statement grid | `p06-company-summary-financials` | `RowLabelCell` hierarchy + `GridValueCell`; totals `Row type="total"`; `numeric` on numbers; version picker via `Selector`+`SelectMenu` |
| Editable model grid (cap table style) | `p07-company-cap-table` | inputs blue / calcs green, live recompute from `useState`, FAB adds a column, one-blank-at-a-time rule |
| Analytics / charts | `p02-intelligence` | chart components only; ≥3 series ⇒ legend + direct labels; remount with `key=` on data change; read `known-gaps` §1 |
| Document list / viewer | `p05`, `p10-company-documents` | `FileRow`/`FileTypeBadge`, `Dropzone` upload modal (Done disabled until file), viewer with `PageStepper`/`ZoomControl` |
| Settings form | `p12-account`, `p16-firm-settings` | Form Patterns; `SettingRow` (applies at once) vs `Checkbox` + Save; `FormField` validation; `ImageCropField` |
| Admin list + row actions | `p13-user-management`, `p14-comp-groups`, `p15-audit-logs` | filter chips, `ContextMenu`/`MenuItem` per row, `ConfirmationDialog`, `EmptyState` |
| Detail / profile | `p11-company-overview-settings` | `KeyValueRow`, `Accordion` for secondary detail |
| Wizard / multi-step task | Information Request in `p10` | `Stepper`, `ProgressBar`/`ProgressRing`, Drawer vs Modal rule (AI-GUIDE §5) |
| Global menu / search | `p01-home` overlays | `openMenu`, `GlobalSearch`; PRISM colours by entity type only |

If nothing fits, **say so** and go to `reuse-ladder.md` rung 6/7 — do not
improvise a layout.

## 3. State & interaction conventions (from the working screens)

- `state` prop only **initialises** UI (`useState(state === 'menu-open')`); keep everything interactive afterwards.
- New visual variant of an existing page ⇒ new **state**, not a new screen.
- Derived numbers are computed in the component/`data.ts` from inputs — never typed as constants — so editing an input updates the page.
- Shared entities (company, fund, user, firm) come from `db` / `fixtures.ts`, so "ABC Co" is the same everywhere.
- Every state a user can reach by clicking must also be reachable by URL (`?state=`), and vice versa.
- Text: sentence case, verbs on buttons ("Add security"), no lorem ipsum — write realistic finance content consistent with fixtures.

## 4. Grounding in Figma (when a link or node id is given, or to check a pattern)

Order of trust: **`AI-GUIDE.md` > page docs > coded screens > Figma frame > screenshot.**

- Node id already in `screens.json` (`figmaNode`) ⇒ the frame is coded; read the coded screen, don't rebuild from Figma.
- To *look* at a frame or pattern: Figma MCP `get_screenshot`, `get_metadata` (structure), `get_design_context` (only for a node not yet coded). Files: components `Z4MtKOfkNEzhMYJzN1q3kR`, product screens `cZktZhD0ssL5lRVOvSqmOV`.
- `get_variable_defs` gives token *names* — map each to the code token by name (`docs/tokens.md`); never copy a hex, and never trust a Figma value that contradicts `tokens.css`.
- The Figma MCP seat has a call cap: read only the nodes you need, batch, and estimate calls before a push.
- Match icons by **meaning** (code = Material Symbols, Figma = SDS_Main).
