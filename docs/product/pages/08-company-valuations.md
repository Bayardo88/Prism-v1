# 08 · Company · Valuations

Company Valuations is where a valuation analyst builds one valuation version of a portfolio company ("Version 1 - 2024-12-31", market date 12/31/2024). The analyst adds approaches (GPC, M&A comps, Backsolve, DCF…), weights them into an enterprise and equity value, allocates the equity across scenarios (Waterfall, OPM) and concludes a value per share and per fund position. Reviewers and auditors read the same pages. The header status shows **Final** and **Ready for Audit**. The screens use the Prism Navigation V4 chrome:
- **Company header:** an `attach_money` toggle reveals Equity Value / Unrealized Firm Total (Information Labels), and an `hourglass_empty` toggle reveals Market Date / Version (light-surface `Selector`s). These are followed by the status badges and ⋮.
- **Tertiary Menu:** one tab per approach (Summary · Conclusions · External Valuation · Specified Share Value · Backsolve) and **+** (Add approach).
- **Actions:** Ask AI, USD ($) Thousands, fit to screen, filter, the green Save split button and ⋮.

Open it from the company's Secondary Menu → **Valuations**.

Source code: `apps/product/src/screens/p08-company-valuations/`. The shared chrome is `ValuationsLayout.tsx`. Every grid is a `DataGrid` + `Row` (the Summary tables use `groupHead` for the column groups). Menus are anchored with `p07-company-cap-table/Anchor.tsx`.

**Data.** `data.ts` keys every figure off the company record. ABC Co gets the frame figures verbatim. For any other company:
- Summary money is scaled by `equityValue ÷ $56.9M`.
- The per-share rows and backsolve targets are its own cap-table securities (p07 `securitiesFor`).
- Conclusions value its fund position at `fairValue`, so MOIC matches the record.
- The header's Equity Value and Unrealized Firm Total come from `equityValue` and `fairValue`, in $ thousands. ABC Co reads $0 because its frame version has no approaches yet.

## Screens

### Valuation Summary — `/companies/:companyId/valuations/summary`
The roll-up of the version, in two parts:
- **Valuation Summary:** how each approach's enterprise and equity value is weighted into each allocation scenario, and the weighted enterprise value after debt and cash.
- **Equity Allocation:** each scenario's method, cap table, OPM inputs, present equity value and weighting, then the present value per share of every security, scenario by scenario and weighted.

A new version has neither part yet, so the default state shows two empty states. Each offers the way forward and opens the Add approach menu.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Valuations — Summary (empty states)](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-24301) | 11:24301 | `#/companies/abc-co/valuations/summary?state=default` |
| populated | [Valuations — Summary](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-10558) (1247 px tall) | 16:10558 | `#/companies/abc-co/valuations/summary?state=populated` |

Components used: ValuationsLayout (CompanyLayout, TertiaryMenuItem, ButtonIcon with `icons.AttachMoney` / `HourglassEmpty` / `FitScreen` / `FilterList` / `MoreVert` / `Add`, InformationLabel, Selector, ModalStatus, AITool, CurrencySelector, SplitButton, ContextMenu, MenuItem), Card, EmptyState (`icons.Error`), Button, DataGrid (`groupHead`), Row, ColumnGroupHeader, AddColumnHeader (`selected`), GridColumnHeader, GridColumnDivider, RowLabelCell, GridValueCell.

Behaviour & rules:
- Approach weights (50.0% / 50.0%) and scenario weighting (75.0% / 25.0%) are inputs (blue). OPM inputs (maturity 5, risk-free rate 4.38%, volatility source Specified, volatility 50.0%) are inputs too. Everything else is calculated. Weighted Enterprise Value and Total are total rows.
- Column groups: *Approaches* (Enterprise Value, Equity Value) | pinned divider | *Allocation Scenarios* (Waterfall, OPM), followed by **Add Allocation Scenario**, which opens the Add approach menu. As in Figma, the weighted results sit in the OPM column.
- Empty states: "The Valuation has no approaches" and "The Equity Allocation has no scenarios". Each carries an action button (the frame has none, but the contract requires `no-data` to offer the filling action).

### Valuation Conclusions — `/companies/:companyId/valuations/conclusions`
The concluded value of every fund position, with one table per entity (ABC Co, Holding Co.). Each table has a navy group band per fund (VIP FUND, Holding Co.), the position rows and a fund total. The columns are Invested Capital, Weighted Value per Share, # of Shares, Value and MOIC.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Valuations — Conclusions](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-10794) | 16:10794 | `#/companies/abc-co/valuations/conclusions?state=default` |

Components used: ValuationsLayout, DataGrid, Row (zebra / total), GridColumnHeader, RowLabelCell (`group-header`, `child`, `total`), GridValueCell.

Behaviour & rules: read-only. The positions and invested capital are the Cap Table → Fund Ownership figures. MOIC = value ÷ invested capital. The values are $0 until an approach concludes.

### Backsolve — `/companies/:companyId/valuations/backsolve`
Solves for the equity value that a transaction in one security implies. The analyst picks up to three allocation methods, each with its cap table and a backsolve weighting, then the target security and its shares. The result is read in the Backsolve Summary (implied equity value, enterprise value). **+** in the tab bar opens **Add approach**, which lists Range sensitivity … Allocation scenario. Backsolve is disabled there because this version already has one.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Valuations — Backsolve](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-20045) | 19:20045 | `#/companies/abc-co/valuations/backsolve?state=default` |
| scrolled | [Valuations — Backsolve (scrolled)](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-26154) | 19:26154 | `#/companies/abc-co/valuations/backsolve?state=scrolled` |
| add-approach-menu | [Valuations — Backsolve · Add approach menu](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-26394) | 19:26394 | `#/companies/abc-co/valuations/backsolve?state=add-approach-menu` |
| duplicate-methods | [Valuations — Backsolve (duplicate allocation methods error)](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-20527) | 19:20527 | `#/companies/abc-co/valuations/backsolve?state=duplicate-methods` |
| method-menu | [Valuations — Backsolve · Allocation method menu (must be unique)](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-29164) | 19:29164 | `#/companies/abc-co/valuations/backsolve?state=method-menu` |
| security-selected | [Valuations — Backsolve · Security selected (unsaved)](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-35448) | 19:35448 | `#/companies/abc-co/valuations/backsolve?state=security-selected` |
| unsaved-confirm | [Valuations — Backsolve · Unsaved changes confirmation](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-37640) | 19:37640 | `#/companies/abc-co/valuations/backsolve?state=unsaved-confirm` |
| validation-banner | [Valuations — Backsolve · Validation errors banner](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-36020) | 19:36020 | `#/companies/abc-co/valuations/backsolve?state=validation-banner` |

Components used: ValuationsLayout, Banner (`negative`, with `issues`), ConfirmationDialog (destructive), DataGrid, Row, GridColumnHeader, GridColumnDivider, RowLabelCell, GridValueCell (editable / error / total), InCellControl (`state="error"`), Tooltip (`open`), InlineEdit, SelectMenu, SelectMenuOption, Button, Icon.

Behaviour & rules (the validation is real, not drawn):
- **Unique allocation methods.** Every column whose method is shared with another column is an `InCellControl state="error"` with the message "The allocation method must be unique" (`errorMessage`, per R8). **Add allocation method** appends a Waterfall column, so adding a second one without changing it immediately trips the rule. The button disables at three methods. Opening a duplicate's menu (Waterfall · CSE · OPM) forces the Tooltip open over the cell.
- **Target securities.** Choosing the security in the last row (the company's cap-table securities, e.g. Common · Series A for ABC Co) opens a fresh "Select security" row below it. **Add row** disables while a blank row is waiting. Shares are typed in place (InlineEdit, "Enter data"), and Target Value sums them.
- **Save.** If any method is duplicated or any target row has no shares, Save raises the negative Banner "To proceed, please correct the highlighted errors…". The banner lists the approach (Backsolve_416, a link back to the top), flags every missing Shares cell and adds an error icon to the Backsolve tab. With no errors, Save clears the unsaved state.
- **Unsaved changes.** Any edit marks the page dirty. While it is dirty, clicking any in-app link (tabs, Secondary or Primary Menu) opens the ConfirmationDialog. **Leave anyway** discards the changes and follows the link, and **Stay on page** keeps them. A browser reload is guarded with `beforeunload`.
- Weightings are inputs (100.0% on the first column, 0.0% on added ones), and Backsolve Total sums them. Present share values, per-share and total values are calculated ($0.00 in the demo). **Add market adjustment** is disabled, as in every frame.
- **scrolled** opens scrolled to the Backsolve Summary.

## Cross-platform links
- In: Company Secondary Menu → Valuations (from every company page). The firm-level Valuations list (page 03) opens a company's valuation.
- Out: tabs link Summary ⇄ Conclusions ⇄ Backsolve. The Secondary Menu leads to Cap Table, which supplies the securities, positions and "Primary Captable" used here, and to Waterfall and Documents.

## Gaps & open questions
- **Routes missing:** the External Valuation and Specified Share Value tabs have no Figma frame and no route in `routes.ts`, so they render as inert tabs. The Add approach menu items don't navigate (only Backsolve has a screen).
- **Forced tooltip placement.** `Tooltip open` wraps its trigger in an inline span, which shrinks a full-width `InCellControl`. So the forced tooltip hangs off a zero-size marker above the cell instead of wrapping the control. A Tooltip `anchor`/block mode would remove this.
- **Menus unclipped by hand and pinned divider track:** the same two workarounds as page 07 (`overflow: 'visible'` on grids with pickers, and explicit `columns` with an `auto` track for `GridColumnDivider`).
- **Confirmation copy follows the DS contract, not the frame.** The frame has title "Confirmation" and confirm "Leave anyways". The contract requires a question title and a repeated verb, so the dialog uses "Leave without saving?" / "Leave anyway" / "Stay on page".
- The live app shows the error marker on the Valuation Summary tab. Here it goes on the Backsolve tab, which holds the errors.
- Guessed: the empty-state action labels ("Add approach", "Add allocation scenario") and the shares error message. The summaries, per-share values and conclusions of non-frame companies are synthetic, scaled from their records.
