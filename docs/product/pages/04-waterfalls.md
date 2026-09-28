# 04 · Waterfalls (Firm)

The firm-level Waterfalls page lets a valuation analyst model an exit for any portfolio company without first opening that company: pick the company, its cap-table date and cap table, set an exit date and enterprise value, and read the firm's total exit proceeds. It is the quick "what would we get if…" tool; the company's own Waterfall page (09) holds its saved views.

## Screens

### Waterfalls — `/waterfalls`
Build one exit scenario for a chosen company. Reached from **Waterfalls** in the Primary Menu on any screen. "Go to <company>" leads to that company's Waterfall page (09); the Workspace drawer's Documents tab links to Company · Documents (upload) and the Information Request editor.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | Waterfalls — New scenario | [16:5197](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-5197) | `#/waterfalls?state=default` |
| backside-blocks | Waterfalls — Backside Blocks scenario | [16:13493](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-13493) | `#/waterfalls?state=backside-blocks` |
| company-picker | Waterfalls — Company picker open | [19:13989](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-13989) | `#/waterfalls?state=company-picker` |
| workspace-documents | Waterfalls — Workspace drawer · Documents | [19:17752](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-17752) | `#/waterfalls?state=workspace-documents` |

Components used: AppFrame/PageHeader (shell), TertiaryMenu, ViewTabBar, ViewTab, CurrencySelector, Button, DataGrid, ColumnHeader (tone="subtle"), Row (zebra), RowLabelCell, GridValueCell, InCellControl, Chip, ComboboxPanel, ShowMoreRow (via ComboboxPanel), Link, Modal (size m), FloatingLabelInput, WorkspaceDock (shell, per-tab panels), FileRow, FileTypeBadge, EmptyState, Icon + Material `icons` (AttachFile, UploadFile, EditNote, TableView, AddLink, Add).

Behaviour & rules:
- Sheet rows: Currency, Company, Cap Table Date, Cap Table, Exit Date (in-cell pickers, blue = input), Foreign Exchange Rate, Plus Cash, Less Debt (green = sourced), Exit Enterprise Value and Exit Equity Value (blue = editable), Firm Total Exit Proceeds (total).
- New scenario: every picker shows "Select option", figures are $0, no Workspace dock (nothing to attach notes to until a company is chosen).
- Figures come from the company's database record (`db`), in millions: exit enterprise value = equity value, cash ≈ 10% of LTM revenue, debt ≈ 1.5× positive LTM EBITDA, Firm Total Exit Proceeds = exit equity × the firm's ownership %. Cap Table Date = the record's as-of date.
- When the company reports in a currency other than the display currency (Backside Blocks: NIO shown in EUR) a second, read-only converted column appears, and the head band shows the rate chip "1 NIO → 0.02 EUR" and "(€) Millions".
- Company picker: ComboboxPanel under the Company cell. With no query it shows the frame's first 8 companies (from `db`) and "Show N more companies", N computed from the database (192); Show more lists all 200 A–Z; typing searches with `db.companies.search`. Selecting closes it and fills the column. Outside click / Escape dismiss. The panel is drawn outside the DataGrid (which clips overflow), anchored to the Company cell.
- "+" next to Current opens the Create Waterfall View modal (shared with page 09); a created view becomes a selected ViewTab.
- "Save Notes & Documents" is disabled until the Workspace drawer has something to save (enabled in the drawer state).
- Workspace dock: Notes, Sheets and Documents each have their own body (Notes/Sheets are empty states with an add action).
- Only Backside Blocks reports in a foreign currency (NIO → EUR, as in the frame); every other company is a single USD column.

## Cross-platform links
- In: Primary Menu → Waterfalls (every screen).
- Out: "Go to <company>" → Company · Waterfall (09); Workspace → Documents → "Add new document" → Company · Documents upload modal (10), "Request new document" → Information Request (10); file rows → Documents (05).

## Gaps & open questions
- InCellControl paints its own surface, so on zebra rows the picker cells stay white instead of taking the stripe.
- FileRow's built-in download action uses the `download` glyph; the frame shows `cloud_download` (FileRow has no icon slot).
- Company reporting currency is not in the database; the NIO/EUR pair for Backside Blocks is area data in `shared.tsx`.
- Figures now come from the record, so the frames' $0 scenario values differ on purpose.

