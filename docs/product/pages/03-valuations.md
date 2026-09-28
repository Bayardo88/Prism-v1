# 03 · Valuations (Firm)

The firm-wide valuation tracker. Valuation analysts and reviewers use it to see where every company's latest valuation stands — its date, open process tasks (document requests, questions), workflow status, approaches and headline values — and to jump into a company's valuation. Reached from **Valuations** in the Primary Menu and the Valuations product tile on Home.

## Screens

### Firm Valuations — `/valuations`
A saved-view grid of every portfolio company (all 200 from `db`: the frame's companies first, then A–Z, 25 per page with `Pagination`) (views "Firm Valuations" and "Steven Valuation View"), ending in an **Add Column** header that opens the Add Columns picker. Company names open the company's Valuation Summary.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Valuations — Firm Portfolio Summary](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-13919) | 11:13919 | `#/valuations` |
| scrolled-add-column | [Valuations — Grid scrolled to Add Column](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-16597) | 11:16597 | `#/valuations?state=scrolled-add-column` |
| add-columns | [Valuations — Add Columns modal](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=14-1134) | 14:1134 | `#/valuations?state=add-columns` |

Components used: AppFrame, FilterDropdown, ViewTabBar, ViewTab, ContextMenu, MenuItem, ButtonIcon, CurrencySelector, DataGrid, Row, GridColumnHeader, RowLabelCell, GridValueCell, AddColumnHeader (selected while the picker is open), ModalStatus, TaskPill, Link, Pagination, Modal (size m), ModalSearch, Checkbox, Overline, Text, Button, Icon.

Behaviour & rules:
- Columns: Valuation Date, Process Management, Valuation Status, Valuation Approaches, Enterprise Value, Equity Value, Breakeven Exit Equity, Allocation Method, Current Fund Value, % Change from Previous. All calculated, read-only, from the company record (equity value, fair value, MOIC, valuation method, stage).
- Headline values show only when the record's valuation is Final or Published; otherwise shaded Not-Applicable cells. Status is the record's workflow status as a ModalStatus.
- Process Management shows "No tasks required" or `TaskPill`s — a negative description pill with the count of open document requests (→ the company's Information Request) and a question_mark pill with open questions (→ Questions). Valuations In Progress have open tasks; DataBricks carries the pair drawn in the frame.
- The "scrolled" frame is the grid scrolled fully right to Add Column. Add Columns: search filters in place, checkboxes pick columns, the footer counts "N of 140 available selected", and **Add Columns** is disabled until at least one is picked.
- Saved view ⋮ → Edit (opens Add Columns) / Clone / Delete; "+" goes to Intelligence → Create Summary View. Page ⋮: Excel Export, Bulk Actions, PDF Export.

## Cross-platform links
- In: Primary Menu → Valuations; Home → Valuations tile.
- Out: company name → `/companies/:id/valuations/summary`; task buttons → company Information Request / Questions; "+" → Intelligence Summaries (Create Summary View).
- Reuses the Intelligence portfolio grid and chrome (`screens/p02-intelligence/`).

## Gaps & open questions
- SpaceX and Perplexity (drawn in the frame) are not in the database and are skipped; figures and statuses come from the records, not the frame.
- Task counts are derived (In Progress valuations + DataBricks); the record has no task data.
