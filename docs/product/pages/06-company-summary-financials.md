# 06 · Company · Summary & Financials

A portfolio company's home and its financial statements. Valuation analysts and fund admins use Summary to see each fund's position in the company (invested capital, shares, ownership, value). They use Financials to enter or review the historical and projected Income Statement, Balance Sheet and KPIs that feed every valuation of the company. Everything runs against the company's **Financials Date** (its `asOf` in the company database — 12/31/2024 for ABC Co) and one **Financials Version** ("Financial Statement 2024-12-31").

**Data.** The company comes from the 200-company database (`db` via `companyById`). Periods derive from its `asOf`: the latest complete fiscal year, two before it, three projection years, LTM = as-of, NTM = as-of + 1 year. P&L figures are the frame's ABC Co figures scaled by `revenueLtm`, and holdings by `invested` / `ownershipPct`, so ABC Co reproduces the frames and every other company reads plausibly. The fund band is the company's own fund (`db.funds`).

Code: `apps/product/src/screens/p06-company-summary-financials/`. The Income Statement, Performance Metrics, Balance Sheet and KPI tables all use one shared grid, `FinancialGrid.tsx`. `CompanyChrome.tsx` holds the header furniture: the ⋮ company actions, the Financials selectors, the Summary and Financials sub-navs, and the Notes panel. Pages 11 reuses it too.

## Screens

### Summary Holdings — `/companies/:companyId/summary`
Positions held in the company, grouped by fund, with Fund Total and Firm Total rows. Users get here from the **Summary** Secondary Menu item or by picking a company in the Companies menu. Summary's Tertiary sub-nav leads on to Company Overview and Daily NAV Settings (page 11).

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Summary — Summary Holdings](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-9624) | 11:9624 | `#/companies/abc-co/summary?state=default` |

Components used: CompanyLayout (PrimaryMenu, SecondaryMenu, TertiaryMenu), TertiaryMenuItem, CurrencySelector, ButtonIcon, ContextMenu, MenuItem, DataGrid, Row, GridColumnHeader (sortable), RowLabelCell (group-header band via `span`), GridValueCell, Material icons.

Behaviour & rules:
- All figures are calculated (read-only), in USD with the ($) Thousands unit. The VIP FUND band is a `group-header` RowLabelCell. Fund Total is a subtotal and Firm Total is a total.
- Every value column can be sorted (none → ascending → descending). Only the positions inside the fund move; the band and the totals stay where they are.
- Concluded Share Value is empty in the source frame.

### Income Statement — `/companies/:companyId/financials/income-statement`
The P&L for FY 2022–2024 (actuals), three projection years (FY 2025–2027) and LTM / NTM. A second Performance Metrics grid sits below it. This is the default Financials page, reached from the **Financials** Secondary Menu item.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Financials — Income Statement](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-20696) | 11:20696 | `#/companies/abc-co/financials/income-statement?state=default` |
| version-menu | [Financials — Version selector open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-25364) | 11:25364 | `#/companies/abc-co/financials/income-statement?state=version-menu` |
| actions-menu | [Financials — Company actions menu open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-12054) | 19:12054 | `#/companies/abc-co/financials/income-statement?state=actions-menu` |
| notes-drawer | [Financials — Notes drawer open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-18159) | 19:18159 | `#/companies/abc-co/financials/income-statement?state=notes-drawer` |

Components used: CompanyLayout (`dockPanels.notes`), TertiaryMenuItem, Selector (`surface="surface"`), ComboboxPanel, Button, ButtonIcon, ContextMenu, MenuItem, CurrencySelector, DataGrid (`groupHead`), Row (`zebra`), ColumnGroupHeader, GridColumnHeader (`editable`), GridColumnDivider, Footnote, RowLabelCell, GridValueCell, SplitButton (`menuPlacement="top"`), WorkspaceDrawer, ViewTabBar, ViewTab, SegmentedControl, RichTextToolbar, Textarea, Material icons (Edit, TableView, PictureAsPdf, Person, MoreVert, Add).

Behaviour & rules:
- Value provenance: FY 2024 figures pulled from the source document are **sourced** (green). LTM figures are **editable** (blue). Gross Profit, EBITDA, EBIT, Pretax Income and Net Income are calculated. Empty historical and projection cells are editable inputs.
- Row hierarchy: Gross Profit and Pretax Income are indented child rows. EBITDA and EBIT are subtotals. Net Income is the total band.
- The brand period rule separates actuals from Projections. LTM / NTM sit after a gutter, and their header dates are editable (blue, with a calendar glyph). FY 2024 carries footnote [1].
- The **Financials Version** selector opens a searchable panel ("Find a Version" → Primary Financial Statement, footer "+ Save as New Version").
- The **⋮ company actions** menu has Edit Company (→ Company Overview), Excel Export, PDF Export and Edit Common Profile (→ Daily NAV Settings).
- **Add Projection Year** appends the next FY column to both grids. Its caret opens "Add Historical Year".
- **Notes** in the Workspace dock opens the (sticky) drawer through `dockPanels.notes`: a Note 1 tab, the Client / Internal audience switch, a rich-text toolbar and the note body. Sheets and Documents have no frame of their own and show the shell default.

### Balance Sheet — `/companies/:companyId/financials/balance-sheet`
Assets, liabilities and equity by period. The **Balance Sheet** tertiary tab leads here.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Financials — Balance Sheet](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-21548) | 19:21548 | `#/companies/abc-co/financials/balance-sheet?state=default` |
| expanded | [Financials — Balance Sheet expanded](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-25279) | 19:25279 | `#/companies/abc-co/financials/balance-sheet?state=expanded` |
| add-year-menu | [Financials — Balance Sheet add year menu open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-27953) | 19:27953 | `#/companies/abc-co/financials/balance-sheet?state=add-year-menu` |
| historical-added | [Financials — Balance Sheet historical year added](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-30302) | 19:30302 | `#/companies/abc-co/financials/balance-sheet?state=historical-added` |
| projection-added | [Financials — Balance Sheet projection year added](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-34233) | 19:34233 | `#/companies/abc-co/financials/balance-sheet?state=projection-added` |

Components used: the Income Statement set, plus RowLabelCell expand / collapse toggles and the SplitButton's top-placed menu.

Behaviour & rules:
- There are three expandable sections: Cash and Equivalents (through Total Assets), Short Term Debt (through Total Current Liabilities) and Long Term Debt (through Total Liabilities and Equity). Collapsed, only the lead rows show, each with a + toggle.
- Line items are editable inputs, and subtotals and totals are calculated. The trailing column is **As Of 12/31/2024**, which has an editable date.
- "Add Historical Year" prepends one more actual year (FY 2021 for ABC Co). "Add Projection Year" appends the next projection year (FY 2028). As in the frames, once a historical year has been added the periods show as FY labels and the trailing group reads LTM.

### KPIs — `/companies/:companyId/financials/kpis`
Company-specific KPIs by period. The **KPIs** tertiary tab leads here.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Financials — KPIs empty](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-38184) | 19:38184 | `#/companies/abc-co/financials/kpis?state=default` |
| row-added | [Financials — KPIs row added](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-40300) | 19:40300 | `#/companies/abc-co/financials/kpis?state=row-added` |
| column-menu | [Financials — KPI column menu open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-41933) | 19:41933 | `#/companies/abc-co/financials/kpis?state=column-menu` |

Components used: EmptyState, Heading, Button, FinancialGrid (GridColumnHeader `selected`, GridValueCell `focused`), ButtonIcon, ContextMenu, MenuItem, MenuDivider, Material icons (KeyboardArrowDown, ContentCopy, Delete, Add).

Behaviour & rules:
- Empty state: "No KPIs yet" with an **Add KPI Row** action. Each click adds one row whose label is an "ENTER DATA" placeholder.
- The columns are the four latest actual years plus four projection years (FY 2021–2028 for ABC Co), with no LTM group.
- The chevron tab above the selected column (FY 2023) opens its column menu: Copy, then a divider, then Delete (destructive, last).

## Cross-platform links
- In: the Secondary Menu on every company page (Summary, Financials), the Companies menu in the Primary Menu, and Home's company directory.
- Out: the company actions menu goes to Company Overview (`routes.company.overview`) and Daily NAV Settings (`routes.company.dailyNavSettings`). Summary's sub-nav also goes to both pages (page 11). The Secondary Menu goes to Cap Table, Valuations, Waterfall and Documents.

## Gaps & open questions
- `FinancialGrid` passes `DataGrid columns` explicitly. The period rule (`GridColumnDivider`) and the LTM gutter are tracks of their own, and a header-derived track would give each a `1fr` share. A `width` prop on `GridColumnDivider` (or a `DataGrid` gutter option) would let the tracks derive from `head` like every other grid.
- The KPI column menu is drawn outside the grid, anchored by measuring its header. The grid scrolls sideways inside itself (`overflow-x: auto`), which would clip an in-grid popover. The DS has no anchored-popover primitive.
- Holdings "Investment Date" comes from the record (`investmentDate`, 11/05/2020 for ABC Co), not the frame's 08/07/2023.
- The Financials Date selector has no Figma frame for an open state, so it is a trigger with no menu.
- The Performance Metrics "+" beside EBITDA Margin has no frame showing what it expands to, so it was left out.
- The note body text ("jkhgkhjgkhj") is copied verbatim from the frame.
