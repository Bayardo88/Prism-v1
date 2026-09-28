# 10 · Company · Documents & Requests

Where a company's files for the selected measurement date live, and where the analyst requests missing documents and answers from the company. Used by valuation teams preparing a valuation and by admins tracking request progress.

## Screens

### Documents — `/companies/:companyId/documents`
List, sort, search and upload the company's documents; track information-request progress. Reached from the company Secondary Menu (Documents) and the Workspace drawer "Add new document" (04/09). Leads to Information Request ("New Info Request", page menu) and to the referenced Financials / Cap Table pages.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | Documents — Document List | [11:13664](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-13664) | `#/companies/abc-co/documents?state=default` |
| upload | Documents — Upload Document modal | [14:4176](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=14-4176) | `#/companies/abc-co/documents?state=upload` |
| page-menu | Documents — Page menu open | [14:4259](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=14-4259) | `#/companies/abc-co/documents?state=page-menu` |

Components used: CompanyLayout (shell), TertiaryMenuItem, Heading, ProgressRing, Text, Button, ButtonIcon, ContextMenu, MenuItem, MenuDivider, Input, DataGrid, ColumnHeader, Row, Cell, CheckboxItem, FileTypeBadge, Link, Modal, Dropzone, FileRow, Icon.

Behaviour & rules:
- Grid columns: select, Format, Name, Source, Upload Date (sortable, newest first), References (links to the area the file feeds), File Requests, Actions (download, ⋮ → Open in viewer / Rename / Move to folder / Delete document).
- Folder rows "/" and "Exports" (collapsible). "Search documents…" filters by name.
- Upload: Dropzone (CSV, DOCX, JPG, PDF, XLSX, ZIP · 250 MB max); Done disabled until a file is chosen; uploaded files are added at the top with today's date and the signed-in user as Source.
- Page ⋮ → "Edit Company Questions and Documents" opens the Information Request editor.

### Information Request — `/companies/:companyId/documents/information-request`
A full-page task (no platform chrome): list documents and questions to request, pick the responsible contact, Send. Back returns to Documents.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | Information Request — New request | [16:13871](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-13871) | `#/companies/abc-co/documents/information-request?state=default` |
| responsible-picker | Information Request — Responsible picker open | [19:19795](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-19795) | `#/companies/abc-co/documents/information-request?state=responsible-picker` |

Components used: ScalarProvider, PageTaskHeader, FormField, Input, RepeatableRow, Button, Heading, Text, ComboboxPanel, Icon.

Behaviour & rules:
- Document Name: type and press Enter to add a request; 7 default requests and 10 default questions (from the frame) are removable rows; "Add question" opens an inline field (Enter adds, Escape cancels).
- Responsible: read-only field opening a ComboboxPanel upward with the firm's contacts and "Add a new responsible".
- Send is disabled until a responsible is chosen and at least one request/question exists.

### Questions — `/companies/:companyId/documents/questions`
Answers to questions sent in requests. Reached from the Documents / Questions sub-nav.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| empty | Questions — Empty | [14:10616](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=14-10616) | `#/companies/abc-co/documents/questions?state=empty` |

Components used: CompanyLayout (shell), TertiaryMenuItem, Heading, ProgressRing, Text, Button, ButtonIcon, ContextMenu, EmptyState.

Behaviour & rules: empty state (no-data) explains what appears here and offers "New Info Request".

## Cross-platform links
- In: company Secondary Menu → Documents; Workspace drawer on Waterfalls (04) and company Waterfall (09); firm Documents (05) empty viewer.
- Out: References → Income Statement / Cap Table (06/07); row menu "Open in viewer" → Documents (05); New Info Request → Information Request.

## Gaps & open questions
- The sub-nav shows Documents and Questions only (as in the frames); Information Request is a task page reached by button, not a tab.
- The frame's per-row kebab on request/question rows became RepeatableRow's remove (Trash) button, per the DS railroad.
- "New Info Request" is a Button that navigates (it starts a task); flag if the lead prefers Link.
- ColumnHeader renders the DS navy header; the frame shows a light header.
- File Requests column content is not visible in the frame ("—").
- The duplicate "Test Steven" in the responsible list is kept as in the frame.
