# 09 · Company · Waterfall

A company's exit waterfall. Analysts set the cap table, exit date and exit enterprise value for the company and save named scenarios ("views") alongside Current, with notes and documents in the Workspace drawer.

## Screens

### Waterfall — `/companies/:companyId/waterfall`
Edit the company's exit assumptions and manage saved views. Reached from the company Secondary Menu (Waterfall) or "Go to <company>" on the firm Waterfalls page (04).

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | Waterfall — Current view | [19:46787](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-46787) | `#/companies/abc-co/waterfall?state=default` |
| create-view | Waterfall — Create waterfall view modal | [19:48005](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-48005) | `#/companies/abc-co/waterfall?state=create-view` |
| saved-view | Waterfall — Saved view "test" | [19:48097](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-48097) | `#/companies/abc-co/waterfall?state=saved-view` |

Components used: CompanyLayout (shell), ViewTabBar, ViewTab, ContextMenu, MenuItem, MenuDivider, CurrencySelector, Button, DataGrid, Row, RowLabelCell, GridValueCell, InCellControl, Chip, Modal, FloatingLabelInput, WorkspaceDock (shell), FileRow, Link.

Behaviour & rules:
- Same sheet as page 04 without Company / Cap Table Date (the company is fixed): Currency, Cap Table ("Primary Captable"), Exit Date (inputs), FX $1.00 and cash/debt (sourced), exit values (editable), Firm Total Exit Proceeds (total).
- "+" opens Create Waterfall View: View Name (FloatingLabelInput), Create disabled until a name is typed, Enter submits; the new view is added and selected.
- Saved views carry a kebab: Duplicate, then Delete view (destructive, after a divider). Current has no kebab and cannot be deleted.
- Save Notes & Documents is disabled (nothing changed in the frames).

## Cross-platform links
- In: company Secondary Menu → Waterfall; Waterfalls (04) "Go to <company>".
- Out: Workspace → Documents → Company · Documents upload (10) and Information Request (10).

## Gaps & open questions
- Reuses ScenarioGrid / CreateViewModal / WorkspaceDocuments from `screens/p04-waterfalls/` (cross-area import).
- View menu items beyond Delete (Rename) are not in the frames; Duplicate is a guess.
- Switching views does not change figures (all zeros in the frames).
