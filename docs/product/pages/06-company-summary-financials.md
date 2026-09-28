# 06 · Company · Summary & Financials

A portfolio company's home and its financial statements. Valuation analysts and fund admins use Summary to see each fund's position in the company (invested capital, shares, ownership, value). They use Financials to enter or review the historical and projected Income Statement, Balance Sheet and KPIs that feed every valuation of the company. Everything runs against one **Financials Date** (12/31/2024) and one **Financials Version** ("Financial Statement 2024-12-31").

Code: `apps/product/src/screens/p06-company-summary-financials/`. The Income Statement, Performance Metrics, Balance Sheet and KPI tables all use one shared grid, `FinancialGrid.tsx`. `CompanyChrome.tsx` holds the header furniture: the ⋮ company actions, the Financials selectors, the Summary and Financials sub-navs, and the Notes panel. Pages 11 reuses it too.

## Screens

### Summary Holdings — `/companies/:companyId/summary`
Positions held in the company, grouped by fund, with Fund Total and Firm Total rows. Users get here from the **Summary** Secondary Menu item or by picking a company in the Companies menu. Summary's Tertiary sub-nav leads on to Company Overview and Daily NAV Settings (page 11).

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Summary — Summary Holdings](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-9624) | 11:9624 | `#/companies/abc-co/summary?state=default` |

Components used: CompanyLayout (PrimaryMenu, SecondaryMenu, TertiaryMenu), TertiaryMenuItem, CurrencySelector, ButtonIcon, ContextMenu, MenuItem, GridColumnHeader, RowLabelCell, GridValueCell.

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

Components used: CompanyLayout, TertiaryMenuItem, InformationLabel, Button, ComboboxPanel, ButtonIcon, ContextMenu, MenuItem, CurrencySelector, ColumnGroupHeader, GridColumnHeader, GridColumnDivider, RowLabelCell, GridValueCell, SplitButton, WorkspaceDrawer/WorkspaceDrawerTab (via WorkspaceDock), ViewTabBar, ViewTab, SegmentedControl, RichTextToolbar, Textarea.

Behaviour & rules:
- Value provenance: FY 2024 figures pulled from the source document are **sourced** (green). LTM figures are **editable** (blue). Gross Profit, EBITDA, EBIT, Pretax Income and Net Income are calculated. Empty historical and projection cells are editable inputs.
- Row hierarchy: Gross Profit and Pretax Income are indented child rows. EBITDA and EBIT are subtotals. Net Income is the total band.
- The brand period rule separates actuals from Projections. LTM / NTM sit after a gutter, and their header dates are editable (blue, with a calendar glyph). FY 2024 carries footnote [1].
- The **Financials Version** selector opens a searchable panel ("Find a Version" → Primary Financial Statement, footer "+ Save as New Version").
- The **⋮ company actions** menu has Edit Company (→ Company Overview), Excel Export, PDF Export and Edit Common Profile (→ Daily NAV Settings).
- **Add Projection Year** appends the next FY column to both grids. Its caret opens "Add Historical Year".
- **Notes** in the Workspace dock opens the drawer: a Note 1 tab, the Client / Internal audience switch, a rich-text toolbar and the note body.

### Balance Sheet — `/companies/:companyId/financials/balance-sheet`
Assets, liabilities and equity by period. The **Balance Sheet** tertiary tab leads here.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Financials — Balance Sheet](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-21548) | 19:21548 | `#/companies/abc-co/financials/balance-sheet?state=default` |
| expanded | [Financials — Balance Sheet expanded](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-25279) | 19:25279 | `#/companies/abc-co/financials/balance-sheet?state=expanded` |
| add-year-menu | [Financials — Balance Sheet add year menu open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-27953) | 19:27953 | `#/companies/abc-co/financials/balance-sheet?state=add-year-menu` |
| historical-added | [Financials — Balance Sheet historical year added](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-30302) | 19:30302 | `#/companies/abc-co/financials/balance-sheet?state=historical-added` |
| projection-added | [Financials — Balance Sheet projection year added](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-34233) | 19:34233 | `#/companies/abc-co/financials/balance-sheet?state=projection-added` |

Components used: the Income Statement set, plus RowLabelCell expand / collapse toggles and the SplitButton menu.

Behaviour & rules:
- There are three expandable sections: Cash and Equivalents (through Total Assets), Short Term Debt (through Total Current Liabilities) and Long Term Debt (through Total Liabilities and Equity). Collapsed, only the lead rows show, each with a + toggle.
- Line items are editable inputs, and subtotals and totals are calculated. The trailing column is **As Of 12/31/2024**, which has an editable date.
- "Add Historical Year" prepends FY 2021. "Add Projection Year" appends FY 2028. As in the frames, once a historical year has been added the periods show as FY labels and the trailing group reads LTM.

### KPIs — `/companies/:companyId/financials/kpis`
Company-specific KPIs by period. The **KPIs** tertiary tab leads here.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Financials — KPIs empty](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-38184) | 19:38184 | `#/companies/abc-co/financials/kpis?state=default` |
| row-added | [Financials — KPIs row added](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-40300) | 19:40300 | `#/companies/abc-co/financials/kpis?state=row-added` |
| column-menu | [Financials — KPI column menu open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-41933) | 19:41933 | `#/companies/abc-co/financials/kpis?state=column-menu` |

Components used: EmptyState, Heading, Button, FinancialGrid (GridColumnHeader selected, GridValueCell focused), ButtonIcon, ContextMenu, MenuItem, MenuDivider.

Behaviour & rules:
- Empty state: "No KPIs yet" with an **Add KPI Row** action. Each click adds one row whose label is an "ENTER DATA" placeholder.
- The columns are FY 2021–2024 plus Projections FY 2025–2028, with no LTM group.
- The chevron tab above the selected column (FY 2023) opens its column menu: Copy, then a divider, then Delete (destructive, last).

## Cross-platform links
- In: the Secondary Menu on every company page (Summary, Financials), the Companies menu in the Primary Menu, and Home's company directory.
- Out: the company actions menu goes to Company Overview (`routes.company.overview`) and Daily NAV Settings (`routes.company.dailyNavSettings`). Summary's sub-nav also goes to both pages (page 11). The Secondary Menu goes to Cap Table, Valuations, Waterfall and Documents.

## Gaps & open questions
- `ColumnGroupHeader`, `GridColumnHeader`, `RowLabelCell` and `GridValueCell` take no width or `style`. Each cell therefore sits in a flex box that owns the column width (`display: grid`, so the cell stretches to fill it). A `width` / `flex` prop on the grid-pattern cells would remove that wrapper.
- `Selector` only works on the brand bar. On the light company header the Financials Date and Version selectors are `InformationLabel`, and the version one is wrapped in a tertiary `Button`. The DS has no light-surface "labelled value picker".
- The DS has no editable-date column header. It is composed from `Text tone="editable"` and the Calendar glyph.
- The SplitButton popover opens downward. On a footer bar it runs under the dock, so the add-year menu is anchored upward by the screen.
- The Workspace drawer is not sticky, so it renders under the page content. The Notes state scrolls to it on mount.
- The frame icons (Excel, PDF, Common Profile) are not in the package. They use Download, Document and User.
- The Financials Date selector has no Figma frame for an open state, so it is static.
- The Performance Metrics "+" beside EBITDA Margin has no frame showing what it expands to, so it was left out.
- The note body text ("jkhgkhjgkhj") is copied verbatim from the frame.
