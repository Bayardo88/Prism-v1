# 02 · Intelligence

Firm-level portfolio reporting. Fund managers, valuation analysts and finance teams use Intelligence to read the whole portfolio at once: a configurable summary grid of every company (Summaries), a security-by-security schedule for reporting (Schedule of Investments), and a daily mark of each holding against market data (Daily NAV). It is reached from **Intelligence** in the Primary Menu and from the Intelligence product tile on Home. This page also carries the global **User Menu** (avatar, far right of the Primary Menu), which is live on every screen.

## Screens

### Summaries — `/intelligence/summaries`
One row per portfolio company, ~30 columns wide: fund, investment dates, ownership, value metrics, preferences, projections and valuation status, saved as named views. Users arrive from the Primary Menu or the Summaries tab; company names open that company's Summary, and the saved-view "+" / ⋮ open the Create / Edit Summary View modal.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Summaries — Firm Summary](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-17914) | 11:17914 | `#/intelligence/summaries` |
| scrolled-value-metrics | [Summaries — Scrolled (Value metrics)](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-11594) | 16:11594 | `#/intelligence/summaries?state=scrolled-value-metrics` |
| scrolled-preferences | [Summaries — Scrolled (Preferences & projections)](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-12542) | 16:12542 | `#/intelligence/summaries?state=scrolled-preferences` |
| scrolled-status-end | [Summaries — Scrolled (Valuation status end)](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-14796) | 19:14796 | `#/intelligence/summaries?state=scrolled-status-end` |
| column-selected | [Summaries — Column selected](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-15817) | 19:15817 | `#/intelligence/summaries?state=column-selected` |
| cell-trend | [Summaries — Cell trend popover](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-24372) | 19:24372 | `#/intelligence/summaries?state=cell-trend` |
| saved-view-menu | [Summaries — Saved view menu](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-32650) | 19:32650 | `#/intelligence/summaries?state=saved-view-menu` |
| create-view | [Summaries — Create Summary View](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-40655) | 19:40655 | `#/intelligence/summaries?state=create-view` |
| page-actions | [Summaries — Page actions menu](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-33030) | 19:33030 | `#/intelligence/summaries?state=page-actions` |
| user-menu | [User Menu — Open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-43157) | 19:43157 | `#/intelligence/summaries?state=user-menu` |
| user-menu-firm-settings | [User Menu — Firm Settings expanded](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-43612) | 19:43612 | `#/intelligence/summaries?state=user-menu-firm-settings` |

Components used: AppFrame, FilterDropdown, SecondaryMenu, SecondaryMenuItem, ViewTabBar, ViewTab, ContextMenu, MenuItem, MenuDivider, ButtonIcon, CurrencySelector, DataGrid, Row, GridColumnHeader, RowLabelCell, GridValueCell, AddColumnHeader, CollapsedColumnRail, ModalStatus, Link, Pagination, CellHistoryPopover, LineChart, Modal (size l), FloatingLabelInput, ModalSearch, Checkbox, Overline, Label, Text, Button, Icon (Material `icons.*`), UserMenu, MenuSubItems.

Behaviour & rules:
- **Rows come from the company database** (`db`, 200 companies): the companies drawn in the frame first, in frame order, then the rest A–Z, 25 per page with `Pagination` (rows-per-page 10 · 25 · 50 · 100). Each name links to that company's own Summary.
- All figures are **calculated** summary values (read-only, Text/Primary) derived from the company record — fund, investment and last-round dates, ownership, as-of date, invested, fair value, MOIC (IRR from MOIC over the holding period), equity value, revenue (projections = LTM × 1.25ⁿ). Totals run over all 200 companies.
- Value metrics (Realized / Unrealized / Total Value, IRR, MOIC, EV, Equity Value, Breakeven, Current Fund Value, % change, ARR multiple, DCF rate, approaches) show only when the record's valuation is **Final or Published**; otherwise they render as shaded Not-Applicable cells and Total Value reads "DRAFT". Valuation Status shows the record's workflow status (Draft · In Progress · In Review · Ready for Audit · Final · Published) as a ModalStatus.
- The grid is a `DataGrid`: column tracks come from the headers (never narrower than the label), body rows are subgrids, zebra stripes. The first column is pinned (sticky) and the grid scrolls horizontally inside itself. Collapsed Column Rails ("+ 8 columns") count the columns hidden left and right and page the grid when clicked. The "Scrolled" frames are the same screen scrolled to Total Value, Total Insight Preference and the end.
- Every column header sorts (none → ascending → descending); the Fund column has an in-header filter. Clicking a cell selects its column and focuses the cell; clicking an **Invested Capital** cell opens the Cell trend popover (value history as a line chart).
- Saved view ⋮: Edit Summary (opens the modal in edit mode), Clone (opens Create), Delete (destructive, last, after a divider). Page ⋮: Excel Export, Bulk Actions, PDF Export.
- Create Summary View: name (prefilled "New View (Copy 2)"), column catalogue with search (filters in place) and checkboxes, the selected list with the two fixed columns (Company, Fund) plus removable columns, Reset to defaults, Add Sort Key. Cancel / Create; the scrim does not dismiss (unsaved state).
- **User Menu** (`shell/overlays/UserMenuOverlay.tsx`): firm header, Account settings → `/account/settings`, Switch firm → Home (firm switcher), User management → `/admin/users`, Comp groups → `/admin/comp-groups`, Audit logs → `/admin/audit-logs`, Firm settings expands in place to Firm profile / Single sign-on / SCIM / Daily NAV settings / Scalar AI / Settings (`/firm-settings/*`), Guided tours, Sign out. Material icons: account_circle, swap_horiz, manage_accounts, groups, history, settings, corporate_fare, lock, sync, show_chart, star_shine, help, logout. Items navigate on click (see gaps). Outside click and Escape close it. The two "User Menu" frames are Summaries states passing `openMenu`.

### Schedule of Investments — `/intelligence/schedule-of-investments`
Every security the firm holds, grouped by company (from `db`: the frame's ABC Co, Backside Blocks, Cohesity, DataBricks first, then the portfolio A–Z; "Show N more companies" adds 10 at a time), each in the company's cap-table currency (USD; Backside Blocks in NIO as drawn). Reached from the Schedule of Investments tab; company headings open the company's Cap Table.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Schedule of Investments — By company](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-45879) | 19:45879 | `#/intelligence/schedule-of-investments` |

Components used: AppFrame, FilterDropdown, SecondaryMenu, Heading, Link, CurrencySelector, DataGrid, Row, GridColumnHeader, RowLabelCell, GridValueCell, ShowMoreRow.

Behaviour & rules:
- One grid per company: Type of Security, Investment Date, Invested Capital, Shares, CSE Shares, Share Value, Fully Diluted Ownership, Realized Value, Unrealized Equity, Total Value, with a Total row. Calculated, read-only values split from the company record: the securities (1–3, by the record's security count) share its invested capital, fair value and ownership; shares = invested ÷ last-round price.
- Currency is per company and is a display label — it never implies a conversion.

### Daily NAV — `/intelligence/daily-nav`
A daily mark for every company (all 200 from `db`, the frame's companies first, 25 per page with `Pagination`): its previous valuation, secondary-market prices (Caplight, Forge, Zanbato), public comp moves and a NAV status, with a Report split button. Reached from the Daily NAV tab; company names (where the company exists) open its Daily NAV settings; the page ⋮ links to Firm Settings → Daily NAV settings.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Daily NAV — Previous valuation & secondary data](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-49440) | 19:49440 | `#/intelligence/daily-nav` |
| public-comps | [Daily NAV — Public comps & NAV status](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-50974) | 19:50974 | `#/intelligence/daily-nav?state=public-comps` |
| report-menu | [Daily NAV — Report menu open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-53212) | 19:53212 | `#/intelligence/daily-nav?state=report-menu` |

Components used: AppFrame, FilterDropdown, SecondaryMenu, FloatingLabelInput, DataFreshness, SplitButton, ContextMenu, MenuItem, DataGrid (groupHead), Row, ColumnGroupHeader, GridColumnHeader, RowLabelCell, GridValueCell, Chip, Icon, Pagination.

Behaviour & rules:
- Column groups: Previous Valuation (3) · Secondary Data (9) · Public Comp Value (3) · NAV Considerations (Status). The second and third frames are the same grid scrolled to Secondary Data.
- Secondary-market prices are **sourced** cells (Text/Sourced); deltas without data show "—".
- Previous Valuation (date, equity value, last-round price per share) comes from the record when its valuation is Final or Published; those rows carry a + expander on the row label.
- Status "No Action Needed" is a positive Chip with a check_circle icon and words (R8).
- Report ▾: Validate / Preview / Finalize / Send Report. Market data freshness shows its time zone and a refresh button.

## Cross-platform links
- In: Primary Menu → Intelligence (every screen); Home → Intelligence product tile; Firm Valuations "+" (create view) lands on the Create Summary View state.
- Out: company names → Company Summary (Summaries), Company Cap Table (SOI), Company Daily NAV settings (Daily NAV); page ⋮ on Daily NAV → Firm Settings · Daily NAV; the User Menu → Account, User Management, Comp Groups, Audit Logs, Firm Settings (all pages), Home (switch firm).
- The shared grid/chrome (`screens/p02-intelligence/PortfolioGrid.tsx`, `chrome.tsx`) is reused by 03 · Valuations (Firm).

## Gaps & open questions
- **Frame companies missing from the database:** SpaceX and Perplexity (Summaries), testttrrrrr and Jun 3 25 (Daily NAV) are not among the 200 records, so they are skipped. Figures now come from the records, so they no longer match the numbers drawn in the frames, and a company's valuation status comes from the record (e.g. Backside Blocks is Draft, not Final).
- **DS bug — `MenuItem` with `href` overflows:** `.scalar-menu-item` is `width: 100%` + padding with content-box sizing, so an `<a>` item is wider than its menu (the button form is border-box by default). This made `summaries?state=user-menu-firm-settings` 1479px wide. Workaround: User Menu and page-action items navigate `onClick` instead of `href`. Fix: `box-sizing: border-box` on `.scalar-menu-item` in `src/styles/components.css`, then restore `href`.
- `PortfolioGrid` keeps a thin local wrapper around `DataGrid` for behaviour the DataGrid does not own: the sticky pinned first column (its cells repeat the zebra stripe so the column stays opaque), scroll-to-column for the "Scrolled" frames, Collapsed Column Rails, and anchoring the trend popover under a cell. A `pinned` column option on DataGrid would remove the first of these.
- Guessed: the Invested Capital history (three points scaled from the record), the FY labels on Projected Revenue, preference figures and Daily NAV market data (none in the record). Row-level blue selection bar not drawn. Column drag-reorder, filtering, Clone/Delete and report actions are visual only.


### Numeric search (prototype)
Global Search answers numeric queries (`10M`, `12.5%`, `3.2x`, `moic 3x`) from the Summaries values for the active firm and selected measurement date, within 10%, capped at 25 rows. Selecting a result opens Summaries with `?hl=<companyId>|<colKey>`: the grid pages to the row, scrolls to the column and focuses the cell. See `tour-checklists/numeric-search.md`.

**Gaps:** access rules, the feature flag and measurement-date availability are fixtures in `data/numericSearch.ts`; "Looking Glass" is assumed to be this grid; `GlobalSearch` has no loading/error/empty slots or row-attribute forwarding, so those states are neutral rows and `data-tour` attributes are set from `SearchOverlay`.
