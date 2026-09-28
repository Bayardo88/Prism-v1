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

Components used: AppFrame/PageHeader (shell), TertiaryMenu, ViewTabBar, ViewTab, CurrencySelector, Button, DataGrid, Row, RowLabelCell, GridValueCell, InCellControl, Chip, Text, ComboboxPanel, ShowMoreRow (via ComboboxPanel), Link, Modal, FloatingLabelInput, WorkspaceDock/WorkspaceDrawer (shell), FileRow, FileTypeBadge, Icon.

Behaviour & rules:
- Sheet rows: Currency, Company, Cap Table Date, Cap Table, Exit Date (in-cell pickers, blue = input), Foreign Exchange Rate, Plus Cash, Less Debt (green = sourced), Exit Enterprise Value and Exit Equity Value (blue = editable), Firm Total Exit Proceeds (total).
- New scenario: every picker shows "Select option", figures are $0, no Workspace dock (nothing to attach notes to until a company is chosen).
- When the company reports in a currency other than the display currency (Backside Blocks: NIO shown in EUR) a second, read-only converted column appears, and the head band shows the rate chip "1 NIO → 0.02 EUR" and "(€) Millions".
- Company picker: ComboboxPanel under the Company cell, "Find a Company" search, first 8 companies then "Show N more companies"; selecting closes it and fills the column. Outside click / Escape dismiss.
- "+" next to Current opens the Create Waterfall View modal (shared with page 09); a created view becomes a selected ViewTab.
- "Save Notes & Documents" is disabled until the Workspace drawer has something to save (enabled in the drawer state).
- Data source: companies from `data/fixtures.ts`; scenario figures are demo zeros, as in the frames.

## Cross-platform links
- In: Primary Menu → Waterfalls (every screen).
- Out: "Go to <company>" → Company · Waterfall (09); Workspace → Documents → "Add new document" → Company · Documents upload modal (10), "Request new document" → Information Request (10); file rows → Documents (05).

## Gaps & open questions
- No DS column-header style for a light grid head band; the band is composed (bg.subtle + stroke.strong rule) inside ScenarioGrid.
- WorkspaceDock renders one body for all tabs, so Notes and Sheets show the Documents content too (shell limitation).
- Firm Total Exit Proceeds is always 0 in the frames; no allocation logic is modelled.
- The frame's "Show 26 more companies" uses the fixture count instead (4 more).
- Frame icons (building, cloud-download, attach) mapped to the nearest structural glyphs (Upload, Mail, Download).
