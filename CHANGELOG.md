# Changelog

## Unreleased
- **Currency Selector picks a currency.** With `currencies` (e.g. the new `WORLD_CURRENCIES`, 30 major currencies),
  the currency code is its own button that opens a searchable list under the chip; picking one reports it through
  `onCurrencyChange` and the unit label takes its symbol (`currencySymbol`). Works alongside the unit cycle. Story
  *Header › Controls › Currency Picker*. On Financials the grids re-express every dollar figure in the picked
  currency at **illustrative** rates (`ILLUSTRATIVE_FX_PER_USD` in `domain/illustrative-calcs.ts`); the list footer
  says they are illustrative, and no rate is shown beside the chip. FX stays an open question (P1): display
  only, nothing is converted or recorded.
- **Currency Selector cycles the display unit.** `CurrencySelector` takes `unit` / `defaultUnit` / `onUnitChange`
  (and `symbol`): each click steps Hundreds → Thousands → Millions → Hundreds, its name says which unit a click
  moves to, and the change is announced. New helpers `CURRENCY_DISPLAY_UNITS`, `nextCurrencyDisplayUnit`,
  `convertCurrencyDisplayUnit` and `formatCurrencyDisplayUnit`. Story *Header › Controls › Currency Unit Cycle*.
  On Financials (Income Statement, Balance Sheet, KPIs) the chip now cycles and every dollar figure in the grids
  rescales from its recorded Thousands; percentages and labels don't change. The unit is kept across the
  Financials tabs (`shell/displayUnit.ts`). Display only: the recorded figures never change.
- **Add Projection Year moves to the Tertiary Menu.** On Financials (Income Statement, Balance Sheet, KPIs) the
  "+ Add Projection Year ▾" split button now sits in the Tier 3 toolbar between the filter icon and Save, instead of
  a footer bar; its menu (Add Historical Year) drops down, and it uses `SplitButton size="xs"` so it matches Save.
- **SplitButton matches Button's variants.** `variant` adds `tertiary`, `tone` adds `warning` and `negative`, and
  `size` takes `xs` · `s` · `m` · `l` (24 · 32 · 40 · 48px), with Button's hover, pressed and disabled treatment.
  Its types are now `ButtonVariant` / `ButtonTone` / `ButtonSize`. The default (primary · main · m) is unchanged.
  New stories *Menus › Actions › Split Tertiary / Warning / Negative / Small / Extra Small / Large / All Variants*.
  The Figma Split Button set (`1591:366`, page 20 · Menus & Actions) now carries the same matrix: 192 variants,
  Style × Size (XS · S · M · L) × Tone × State, every fill, stroke, padding and height bound to v1.1 tokens.
- **Portfolio grids scroll again.** `PortfolioGrid` looked for its scroller with `[role=grid]`, but `DataGrid` renders
  `role="table"`, so its sideways scroll silently did nothing: Daily NAV › Public comps opened at the far left, the
  Summaries "Scrolled" states and Firm Valuations' scroll-to-end didn't scroll, and the "+ N columns" rails
  neither counted nor paged. It now finds the table.
- **Pinned table header on single-table pages.** When a page body holds exactly one visible table taller than the room
  left, the shell (`usePinnedTableHead`, wired in `AppFrame`) bounds it to the remaining height, so its rows scroll
  under its `ColumnHeader` row, which stays under the navigation tiers. Sideways scroll and pinned first columns keep
  working. Pages with two or more tables, and tables that already fit, are left alone. Applies today to Firm
  Valuations, Intelligence Summaries, Daily NAV and Firm Settings › Daily NAV Companies. Documented in the navigation
  spec §3, `page-template.md` and AI-GUIDE R15; new *Core › PageTemplate › Single Table Pinned Header* story.
- **Sticky navigation tiers.** `AppFrame` is now exactly one viewport tall and the document no longer scrolls: the
  Primary Menu, company header + Secondary Menu and Tertiary Menu stay pinned at the top while each screen's body
  `<main>` scrolls under them (the Workspace dock stays at the foot). `CompanyLayout`, `PageBody` and the screens with
  their own `<main>` use the new `scrollBody` style. Documented in the navigation spec §1/§3 and `page-template.md`;
  new *Core › PageTemplate › Scrolling Body* story.
- **No gutter before LTM / NTM.** Income Statement, Performance Metrics, Balance Sheet and KPIs no longer leave a
  blank track between the last projection and the trailing LTM / NTM (or As Of) columns: `FinancialGrid` drops its
  gutter slot. The rule is in AI-GUIDE R16 and the new *Data › GridPatterns › Statement Trailing Periods* story.
- **One column header for every table (R16).** Every product grid's head is now `ColumnHeader`, the header in the
  Storybook *Data › Table* stories: Firm Valuations and the Intelligence portfolio grids, Summary & Financials,
  Cap Table, Fund Ownership, Breakpoints, Cash Flow Ledger, the company Valuations tabs (Summary, Conclusions,
  Backsolve, weighting panel), Comp Groups, the Sheets panel and the approach / report-composer prototypes. Sorting
  keeps its three-step cycle through `onSortChange`; the Fund filter moved to the header's `actions`; the decorative
  drag handle is gone. The trailing add-column header is the new product `AddColumn` (`ColumnHeader
  kind="action-button"` + a `ButtonIcon`). `npm run lint:tables` now also fails on `GridColumnHeader` /
  `AddColumnHeader` in product or example code (the Gallery showcase excepted); both stay in the library for Figma
  parity. Figma frames still draw the Grid Column Header, so the coded grids now differ from them in the header row.
- **Product logic in the prototype (AI-GUIDE §11, P1–P10).** `docs/product/domain-logic.md` is the domain contract,
  condensed from the 2025 training guide (kept as reference in `docs/product/training-notes-2025/`). `apps/product`
  gains a domain layer (`src/domain/`): one valuation context per company (measurement, versions, breakpoint mode,
  auditor view), the market date held apart from the measurement date, Financials / Cap Table / Valuation versions with
  Save as New Version, and Cap Table ↔ Fund Ownership pairing. A version or date switch remounts the page from the new
  version. Workflow status is shared with the firm pages, so Publish shows up there. Placeholder `$0`s now read "—",
  "Not calculated" or "Draft". The validation is real: weights total 100%, custom breakpoints ascend, and transaction
  dates fall on or before the measurement. Every editor has a save state and the unsaved-changes guard. Calibrated
  approaches are left out of the summary. The new flows have no Figma frames, so they ship as prototypes: approach tabs,
  rollover, bulk market-date update, Excel export, respondent portal and the 409A composer. New checks run in
  `verify:product`: `npm run test:product` (domain unit tests) and `npm run lint:product-logic` (placeholder zeros and
  market date fed from the as-of date). `scripts/serve.mjs` takes a `PORT`.
- **No table shows pagination (R15).** `DataGrid` and `Table` render every row and nothing pages them. Removed the
  `Pagination` bars from Daily NAV, Summaries, Firm Valuations, Daily NAV Companies, SCIM Revoked Tokens and the Cap Table
  example; those grids now list every row (Global Search's `?hl=` no longer pages to the row, it only scrolls to it).
  New `npm run lint:tables` (in `verify` and `verify:product`) fails on any `Pagination` / `PageItem` in product or
  example code; the Playground showcase is the one exception. `Pagination` stays in the library for non-table use.
  Documented in AI-GUIDE R15, CLAUDE.md, the Prism Table spec, `docs/components.md` and the page docs.
- **AI gradient tokens** — `--color-gradient-ai-{violet|blue|teal|pink}` (`color.gradient.ai.*`), Light + Dark, the AI fill
  plus the teal and pink (and blue) of Global Search, as their own tokens, not PRISM (R11). In the contrast gate at 3:1 on
  page and surface. In Figma as *Semantic: Color › Gradient/AI/\** (published 2026-10-23; known gap 15).
- **`AiOutline`** — a 2px outline in the AI gradient whose colours orbit it every 6s while AI works (`active`), following
  the corners with no seam (`@property` angle on a conic gradient); still when inactive or under reduced motion. `asChild`
  puts it on your own element. Story *Feedback › AiOutline* checks the motion in the browser; guide `docs/ai-outline.md`
  and Storybook page *Feedback › AiOutline spec*. Figma: **AI Outline** (components file, page 24), plus the proposed
  **Notification Item** and **Notification Panel** (page 25) behind the Notifications Center prototype.
- **`Toast` dismiss button** — the × now takes the toast's ink (`--toast-ink`) instead of the main tone's brand ink, which
  was 1:1 on the brand (info) fill and about 1.1:1 on an AI fill (R3). Hover and press darken the fill (`overlay.subtle`). New story
  *Toast (dismissible)* checks the computed colour in the browser, because axe's contrast rule skips icon-only controls.
- **Deal tokens** — `--color-deal-{background|text|subtle|subtle-text|control}` (`color.deal.*`), Light + Dark, aliasing the Teal
  scale (Figma "Accent"), in the contrast gate. Added to the tokens file as *Semantic: Color › Deal/\** (known gap 14).
- **Workboard Valuation modal** — `ValuationModal`, `ValuationSummary`, `ValuationPanel`, `FigureList`, `StepAssignMenu`,
  `StatusTrigger`, `AssigneeCard`, `AssigneeAvatars`, `NoteCard`, `NoteComposer`, from the workboard Figma "Assign users form
  Modal" (532:16434). `DealCard` gains `tone="deal"` and `contractAction`; `SegmentedControl` gains `variant="outline"`, `count`
  and `fullWidth`; `RichTextToolbar` gains `formats` and a Numbered list; `Modal` gains `size="2xl"` (1308px). The small
  checkbox box now uses Radius/XS, as Figma CheckboxItem S does.
- **Documentation** — AI-GUIDE (§5 intents, §7 Modal 2xl, SegmentedControl outline, RichTextToolbar formats),
  `docs/components.md` (Workboard 20, with Figma nodes), README / ONBOARDING (counts, Storybook, adding a new
  token), known gap 14 (Deal published; frames pending) and a Storybook page, *Workboard › Valuation Modal spec*.
- **Storybook MDX tables** — `remark-gfm` (dev dependency) is now wired into `@storybook/addon-docs`, so pipe tables in
  the MDX spec pages render; the *Prism Table spec* page's tables were showing as raw text.
- `StepAssignMenu`'s assign button names itself from its content, so the visible initials are part of its name
  (WCAG 2.5.3); controls inside an inverse `AssigneeCard` take Text/Inverse.
- **Workflow tone tokens** — `--color-workflow-{blue|pink|cyan|orange}-{background|text|stroke|solid|on-solid}` (`color.workflow.*`),
  Light + Dark, in the contrast gate. `WorkflowTone` gains `blue | pink | cyan | orange`. Code-first from the workboard-v2 proposed
  collection, pending the Scalar tokens library (known gap 13).
- **Workboard components** — `ActionPill`, `ActionTag`, `DueDatePill`, `StepMenu` (+ sections), and now `DealCard`, `ColorPicker`,
  `WorkCalendar` + `CalendarTaskCard`, `WorkTimeline` and `PeriodToolbar`: prop-driven ports of the Workboard prototype, each with
  tests and stories under Storybook › Workboard.
- **`Cell`** — only total / sub-total cells keep the grey outline; an error cell shows its red ring only while selected; draft has none.
- **`Table`** — the one Prism table for the whole platform (Valuations, Waterfalls, Financials, Cap Table, Companies, Reports, Workboard):
  a `role="grid"` with a data contract (`TableProps`), a derived selection model drawn as one perimeter overlay, content-minimum column
  resizing with persistence, formula mode with an fx bar, spreadsheet keyboard and inline editing. Pure logic lives in
  `table/tableModel.ts`. `Cell` gains `hover` / `pressed` states; `RowHeader` gains `selected`; `ColumnHeader` gains `selected` / `active`.
  `DataGrid` is unchanged and remains the static `role="table"`. Spec: Storybook → Data/Table/Prism Table spec.
- Accessibility and API-consistency remediation from the 2026-10-06 code audit: shared primitives (`Slot`/`asChild`, `useOverlay`,
  `useRovingFocus`, `useFieldIds`), keyboard models for menus, tabs, grids, trees, date picker and overlays, `ref`/native-prop
  forwarding across the component set, tests, CI and linting. See `docs/component-contract.md`.

## 1.1.0
- Initial v1.1 token and component layer.
