# 05 · Documents (Firm)

The firm-wide document library. Analysts and admins use it to find any file the firm holds, organised by measurement date and company, to add folders and uploads, and to preview a file without leaving the page.

## Screens

### Documents — `/documents`
Browse all measurement-date folders, or pick a company to see its tree and preview a document beside it. Reached from **Documents** in the Primary Menu. The company tab (closable ViewTab) returns to All Documents; "Upload Document" leads to the company's Documents page upload modal (10).

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | Documents — All Documents | [19:24011](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-24011) | `#/documents?state=default` |
| pdf-loading | Documents — Company selected · PDF loading | [19:38422](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-38422) | `#/documents?state=pdf-loading` |
| pdf-viewer | Documents — PDF viewer | [19:44982](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-44982) | `#/documents?state=pdf-viewer` |
| add-folder | Documents — Add Folder modal | [19:47312](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-47312) | `#/documents?state=add-folder` |
| parent-folder-picker | Documents — Add Folder · Parent Folder picker | [19:48713](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-48713) | `#/documents?state=parent-folder-picker` |

Components used: AppFrame/PageHeader (shell), TertiaryMenu, ViewTabBar, ViewTab, Checkbox, CheckboxItem, ButtonIcon, Button, Heading, Text, FilterDropdown, Input, Chip, Badge, ScrollHintPill, TreeItem, FileRow, FileTypeBadge, DocumentViewerHeader, PageStepper, ZoomControl, Spinner, EmptyState, Link, Modal, FormField, ComboboxPanel, Icon.

Behaviour & rules:
- Left: All Companies list with fund tag (Chip) and document count (Badge), "Find Company" filters it; the ScrollHintPill says how many are below the fold.
- All Documents: one band per measurement date (counts + request progress, Add Subfolder, Upload Document, collapse). 03/31/2025 opens to Backside Blocks → root files (uploader, date, linked area chips) → Company Docs / Exports subfolders.
- Company selected: compact tree (icon-only folder actions) and a viewer. Clicking a file shows "Preparing PDF preview…" (Spinner) for ~1.2s, then the page with PageStepper (1/12) and ZoomControl (100%, Fit). With no file chosen the viewer is an EmptyState.
- Add Folder: opened from a date band's add-folder action. Parent Folder is a read-only field that opens a ComboboxPanel ("Find a Folder": No Folder, Company Docs, Exports); Folder Name required — Create Folder stays disabled until it is filled; the new folder is appended to the tree. Scrim click does not dismiss once a name is typed.
- "Select all documents" checks every file row; indeterminate when some are checked.
- Viewer body text is placeholder copy, not the real PDF.

## Cross-platform links
- In: Primary Menu → Documents; Waterfalls Workspace drawer file rows (04); company Documents row menu "Open in viewer" (10).
- Out: Upload Document → Company · Documents upload modal (10); empty viewer → Company · Documents (10).

## Gaps & open questions
- Company list row, measurement-date band and viewer page surface are composed in the area folder (no DS "directory list row" or "folder band" component).
- Companies not in the shared fixtures (Empty Company, Euros Financials, GPC, jan23…) exist only on this page; their company links fall back to ABC Co.
- "Filter by Fund" shows the value in force ("All funds") per the FilterDropdown rule; the filter menu is not built.
- Search / Filter / Full-screen toolbar icons and the viewer's download/copy/rename/delete are inert.
- Exports file names were truncated in the frame; full names are guessed.
