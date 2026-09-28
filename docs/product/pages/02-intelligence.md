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

Components used: AppFrame, FilterDropdown, SecondaryMenu, SecondaryMenuItem, ViewTabBar, ViewTab, ContextMenu, MenuItem, MenuDivider, ButtonIcon, CurrencySelector, GridColumnHeader, RowLabelCell, GridValueCell, AddColumnHeader, CollapsedColumnRail, ModalStatus, Link, CellHistoryPopover, LineChart, Modal, FloatingLabelInput, ModalSearch, Checkbox, Overline, Label, Text, Button, Icon, UserMenu, MenuSubItems.

Behaviour & rules:
- All figures are **calculated** summary values (read-only, Text/Primary) — nothing in this grid is editable or directly sourced.
- Value metrics (Realized / Unrealized / Total Value, IRR, MOIC, EV, Equity Value, Breakeven, Current Fund Value, % change, ARR multiple, DCF rate, approaches) show only for **published** valuations (Backside Blocks = Final, Debt Only = Published); for drafts they render as shaded Not-Applicable cells and Total Value reads "DRAFT". The footnote "Summary values shown for published valuations" says so.
- The first column is pinned; the grid scrolls horizontally. Collapsed Column Rails ("+ 8 columns") count the columns hidden left and right and page the grid when clicked. The "Scrolled" frames are the same screen scrolled to Total Value, Total Insight Preference and the end.
- Every column header sorts (none → ascending → descending); the Fund column has an in-header filter. Clicking a cell selects its column and focuses the cell; clicking an **Invested Capital** cell opens the Cell trend popover (value history as a line chart).
- Saved view ⋮: Edit Summary (opens the modal in edit mode), Clone (opens Create), Delete (destructive, last, after a divider). Page ⋮: Excel Export, Bulk Actions, PDF Export.
- Create Summary View: name (prefilled "New View (Copy 2)"), column catalogue with search (filters in place) and checkboxes, the selected list with the two fixed columns (Company, Fund) plus removable columns, Reset to defaults, Add Sort Key. Cancel / Create; the scrim does not dismiss (unsaved state).
- **User Menu** (`shell/overlays/UserMenuOverlay.tsx`): firm header, Account settings → `/account/settings`, Switch firm → Home (firm switcher), User management → `/admin/users`, Comp groups → `/admin/comp-groups`, Audit logs → `/admin/audit-logs`, Firm settings expands in place to Firm profile / Single sign-on / SCIM / Daily NAV settings / Scalar AI / Settings (`/firm-settings/*`), Guided tours, Sign out. Outside click and Escape close it. The two "User Menu" frames are Summaries states passing `openMenu`.

### Schedule of Investments — `/intelligence/schedule-of-investments`
Every security the firm holds, grouped by company, each in the company's cap-table currency (ABC Co in USD, Backside Blocks in NIO). Reached from the Schedule of Investments tab; company headings open the company's Cap Table.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Schedule of Investments — By company](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-45879) | 19:45879 | `#/intelligence/schedule-of-investments` |

Components used: AppFrame, FilterDropdown, SecondaryMenu, Heading, Link, CurrencySelector, GridColumnHeader, RowLabelCell, GridValueCell.

Behaviour & rules:
- One grid per company: Type of Security, Investment Date, Invested Capital, Shares, CSE Shares, Share Value, Fully Diluted Ownership, Realized Value, Unrealized Equity, Total Value, with a Total row. Calculated, read-only values.
- Currency is per company and is a display label — it never implies a conversion.

### Daily NAV — `/intelligence/daily-nav`
A daily mark for every company: its previous valuation, secondary-market prices (Caplight, Forge, Zanbato), public comp moves and a NAV status, with a Report split button. Reached from the Daily NAV tab; company names (where the company exists) open its Daily NAV settings; the page ⋮ links to Firm Settings → Daily NAV settings.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Daily NAV — Previous valuation & secondary data](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-49440) | 19:49440 | `#/intelligence/daily-nav` |
| public-comps | [Daily NAV — Public comps & NAV status](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-50974) | 19:50974 | `#/intelligence/daily-nav?state=public-comps` |
| report-menu | [Daily NAV — Report menu open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-53212) | 19:53212 | `#/intelligence/daily-nav?state=report-menu` |

Components used: AppFrame, FilterDropdown, SecondaryMenu, FloatingLabelInput, DataFreshness, SplitButton, ContextMenu, MenuItem, ColumnGroupHeader, GridColumnHeader, RowLabelCell, GridValueCell, Chip, Icon.

Behaviour & rules:
- Column groups: Previous Valuation (3) · Secondary Data (9) · Public Comp Value (3) · NAV Considerations (Status). The second and third frames are the same grid scrolled to Secondary Data.
- Secondary-market prices are **sourced** cells (Text/Sourced); deltas without data show "—".
- Companies with a previous valuation (jan23, Backside Blocks) carry a + expander on the row label.
- Status "No Action Needed" is a positive Chip with a check icon and words (R8).
- Report ▾: Validate / Preview / Finalize / Send Report. Market data freshness shows its time zone and a refresh button.

## Cross-platform links
- In: Primary Menu → Intelligence (every screen); Home → Intelligence product tile; Firm Valuations "+" (create view) lands on the Create Summary View state.
- Out: company names → Company Summary (Summaries), Company Cap Table (SOI), Company Daily NAV settings (Daily NAV); page ⋮ on Daily NAV → Firm Settings · Daily NAV; the User Menu → Account, User Management, Comp Groups, Audit Logs, Firm Settings (all pages), Home (switch firm).
- The shared grid/chrome (`screens/p02-intelligence/PortfolioGrid.tsx`, `chrome.tsx`) is reused by 03 · Valuations (Firm).

## Gaps & open questions
- No product icon set: menu and toolbar icons use the closest structural glyphs (Folder for Firm profile, Link for SSO, Sparkle for Scalar AI…); the Daily NAV row glyph (≡×) is omitted.
- Grid-pattern cells (GridValueCell, RowLabelCell) take no `style`/data props, so the grid wraps each in a layout div for widths, pinning and anchoring. A width/`pinned` prop on the grid patterns would remove the wrappers.
- `Modal` is fixed at 560px; the Figma Create Summary View is wider — the two panes sit side by side at 560.
- `ModalStatus` has no "Published" state; it is shown as Complete with the label "Published".
- The trend popover history (3 × $100,000) and the FY labels on Projected Revenue columns (FY26–28; Figma truncates them) are guessed. Row-level blue selection bar not drawn. Column drag-reorder, filtering, Clone/Delete and report actions are visual only.
