# 07 · Company · Cap Table

The Cap Table area is where an analyst builds and keeps the capital structure of one portfolio company: the securities it has issued, what each fund owns in them, the equity breakpoints those securities create, and the cash flows behind each position. Valuation teams and fund accountants use it. Every valuation, waterfall and fund conclusion downstream reads from this version of the cap table ("Primary Captable", shown as Draft in the company header). Open it from the company's Secondary Menu → **Cap Table**. Its four sub-pages sit in the Tertiary Menu: Cap Table · Fund Ownership · Breakpoint Analysis · Cash Flow Ledger.

Source code: `apps/product/src/screens/p07-company-cap-table/`. `Sheet.tsx` is the CSS-grid shell for the grid-pattern cells. It is also used by page 08.

## Screens

### Cap Table — `/companies/:companyId/cap-table/securities`
Enter each security's terms (investment date, type, original issue price, shares outstanding, conversion rate) and read the ownership, fully diluted shares and liquidation preferences derived from them. A second grid shows the firm's own holdings in each security (Spatical Ventures). You get here from Secondary Menu → Cap Table, which is the default sub-page. **Add Security** (the FAB) adds a blank column.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Cap Table — Securities](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-15081) | 11:15081 | `#/companies/abc-co/cap-table/securities?state=default` |
| new-column | [Cap Table — New security column](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-18882) | 11:18882 | `#/companies/abc-co/cap-table/securities?state=new-column` |
| security-type-menu | [Cap Table — Security Type menu open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-19396) | 11:19396 | `#/companies/abc-co/cap-table/securities?state=security-type-menu` |

Components used: CompanyLayout (shell), TertiaryMenuItem, InformationLabel, ModalStatus, ButtonIcon, CurrencySelector, SplitButton, GridColumnHeader, InlineEdit, RowLabelCell, GridValueCell, InCellControl, GridColumnDivider, ContextMenu, MenuItem, Fab.

Behaviour & rules:
- Inputs are blue (`GridValueCell kind="editable"` / `InCellControl`): investment date, security type, original issue price, shares outstanding and conversion rate. Everything else is calculated. Totals are bold and have a rule.
- Current and fully diluted ownership, fully diluted shares and liquidation preference (shares × issue price, for Preferred Stock only) are computed live from the column data. When a new column is added, it shows 0.0%.
- The new column's header is an `InlineEdit` ("Enter name"). Its Security Type opens a menu with Preferred Stock, Common Stock, Warrant, Option, Unissued Options and Note. Only one blank column can exist at a time.
- Strike Price, Preferred Terms and the firm-holdings rows carry an expand toggle (collapsed), as in the frames.
- The Cap Table Version picker and the Draft status are display-only.

### Fund Ownership — `/companies/:companyId/cap-table/fund-ownership`
Record each fund's position in each security: entity, fund, investment date, invested capital, shares, and the derived loan value, preferences, distributions and proceeds. There are two filter bands, fund (VIP Fund) and security (Series A · Holding Common · Common). **Add Fund Ownership** (the split button in the footer) appends a blank position.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Fund Ownership — VIP Fund](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-24812) | 11:24812 | `#/companies/abc-co/cap-table/fund-ownership?state=default` |
| new-column | [Fund Ownership — New ownership column](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-10022) | 16:10022 | `#/companies/abc-co/cap-table/fund-ownership?state=new-column` |

Components used: CapTableLayout, Chip, SplitButton, ContextMenu, MenuItem, GridColumnHeader, InCellControl, RowLabelCell, GridValueCell, GridColumnDivider.

Behaviour & rules:
- Entity and Fund (or Entity) are in-cell selects. Investment date, invested capital, shares, cash distributions and proceeds are editable (blue). The other rows are calculated. The pinned Total sums the columns.
- A new column picks its security from the header select ("Select option"). Entity defaults to ABC Co and Fund to "Select option".
- The filter chips are display-only. The DS Chip is not a toggle.

### Breakpoint Analysis — `/companies/:companyId/cap-table/breakpoints`
Shows the equity values at which each security starts to participate. By default they are calculated from the cap table. **Use custom breakpoints?** (a Switch) changes the per-security amounts into inputs. It also shows Save and **Add Breakpoint** (FAB).

| State | Figma frame | Node | Open with |
|---|---|---|---|
| calculated | [Breakpoints — Calculated](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-14388) | 16:14388 | `#/companies/abc-co/cap-table/breakpoints?state=calculated` |
| custom-3 | [Breakpoints — Custom (3)](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-14358) | 19:14358 | `#/companies/abc-co/cap-table/breakpoints?state=custom-3` |
| custom-4 | [Breakpoints — Custom (4 added)](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-17438) | 19:17438 | `#/companies/abc-co/cap-table/breakpoints?state=custom-4` |

Components used: CapTableLayout, Switch, GridColumnHeader, RowLabelCell, GridValueCell, Fab.

Behaviour & rules:
- Calculated mode is read-only: ranges $0 → $1,112,233 → $90,001,121 → Infinity, and the last breakpoint is Pro Rata. There is no Save in this mode.
- Custom ranges are symbolic ($0 to $A, $A to $B, …, then "to Infinity"). Adding a breakpoint re-letters the chain, and the last one is always open-ended. The Common and Series A amounts are editable.

### Cash Flow Ledger — `/companies/:companyId/cap-table/cash-flow-ledger`
Lists every transaction on the company's positions and rolls them up into a Cash Flow Summary per fund (total investments, proceeds, net cost basis, gross IRR). **Add Transaction** appends an editable row.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Cash Flow Ledger — Transactions](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-19341) | 19:19341 | `#/companies/abc-co/cap-table/cash-flow-ledger?state=default` |
| new-row | [Cash Flow Ledger — New transaction row](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-21138) | 19:21138 | `#/companies/abc-co/cap-table/cash-flow-ledger?state=new-row` |

Components used: CapTableLayout, GridColumnHeader, Tooltip, ButtonIcon, GridValueCell (sourced), InCellControl (date, currency, select), ContextMenu, MenuItem, Button, Heading, RowLabelCell.

Behaviour & rules:
- Existing transactions are sourced from Fund Ownership, so they are shown in green (`kind="sourced"`) and are read-only.
- The new row has a date picker ("Select date"), a USD currency pill, an editable amount and description, and selects for Type (default Investment), Owner, Entity and Security. Only one draft row can exist at a time.
- Net cost basis is shown negative. Gross IRR is N/A until proceeds exist. The ABC Co line is the total row.

## Cross-platform links
- In: Company Secondary Menu → Cap Table (from every company page), and the Companies menu in the Primary Menu.
- Out: the Tertiary Menu links the four sub-pages to each other. The Secondary Menu leads to Summary, Financials, Valuations, Waterfall and Documents.
- Data: the same ABC Co positions (Series A / Holding Common / Common; VIP Fund, Holding Co.) feed Valuations → Conclusions and Backsolve on page 08.

## Gaps & open questions
- **No grid container for the grid-pattern cells.** `DataGrid` lays out flex rows of `Cell`. `RowLabelCell` / `GridValueCell` / `InCellControl` / `GridColumnHeader` have no shell, so `Sheet.tsx` composes one (CSS grid, rows are `display: contents`). It is a candidate DS component.
- **No zebra striping.** The grid-pattern cells paint their own `bg.surface`, so a row background cannot show through.
- The product icon set (SDS_Main) is not in the package. The Type info icon uses `glyphs.Info`.
- Figma writes the firm as "Spatial Ventures". The fixtures use "Spatical Ventures" (`firm.name`), which is also what the live app shows.
- Guessed: the transaction types other than "Investment" (Distribution, Sale of shares), the Fund Ownership split-button menu item, and the Type tooltip copy.
- The screenshots show the header labels of custom breakpoints in red (probably "not yet entered"). The Figma frames don't carry that, so it was not reproduced.
