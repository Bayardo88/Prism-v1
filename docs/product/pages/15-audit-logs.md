# 15 · Audit Logs

Audit Logs is the firm admin's record of every change made in Scalar: who changed which object, in which feature and company, and what the new values were. Compliance, auditors and firm admins use it to trace edits to financials, documents and valuations.

## Screens

### Audit Logs — `/admin/audit-logs`

A filterable, newest-first log table. Reached from the user menu (admin section). Rows are read-only; the magnifier on each row opens the full change payload.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Audit Logs — Log table | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-47076) | 19:47076 | `#/admin/audit-logs?state=default` |

Components used: AppFrame, FilterBar, Select, FloatingLabelInput (date), FloatingLabelSelect, Button, DataGrid, ColumnHeader, Row, Cell, ButtonIcon, Text, Modal, Icon.

Behaviour & rules:
- Filters: business unit (Select, placeholder "Select a business unit"), Start date, End date, Product (default "Portfolio Valuations"); "Refresh" re-runs the query (resets paging in the prototype).
- "Viewing 50 logs in total" states the total; the table shows 9 rows and "Load more" appends 9 at a time, disabled when all 50 are shown.
- Timestamp column is sortable (newest first by default).
- Details are truncated to one line; the magnifier ButtonIcon opens a Modal with the full payload.
- All cells are read-only (`readable`).

## Cross-platform links
- In: user menu → Audit Logs.
- Out: none — companies in the log (Anthropic, Airbus SAS) are not in the shared fixtures, so they are not linked.

## Gaps & open questions
- The Figma frame shows no page header; kept that way (no PageHeader).
- The details drawer/modal is not drawn in Figma; the Modal is an assumption.
- Rows 10–50 are generated on the pattern of the 9 Figma rows.
- Figma section name for the frame was not in the brief; recorded as "Audit Logs".
