# 14 · Comp Groups

Comp Groups is the firm-level library of comparable sets that valuations use for their multiples. Firm admins and analysts keep **public comp groups** (listed companies, with Capital IQ tickers) and **transaction comp groups** (precedent deals) here, so every valuation in the firm picks from the same curated sets.

## Screens

### Comp Groups — `/admin/comp-groups`

Lists every comp group as a collapsible panel: its name, previous versions, and the comparable companies in it. Users get here from the user menu (admin section); the floating "Add comp group" button creates new groups. Valuations → Market approach (company Valuations pages) consume these groups.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Comp Groups — Public comp group | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-37494) | 19:37494 | `#/admin/comp-groups?state=default` |
| Comp Groups — Add comp group speed dial open | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-42969) | 19:42969 | `#/admin/comp-groups?state=speed-dial` |
| Comp Groups — New transaction comp group | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-45657) | 19:45657 | `#/admin/comp-groups?state=new-transaction` |

Components used: AppFrame, PageHeader, Button, AccordionItem, DataGrid, Row, RowLabelCell, GridValueCell, GridColumnHeader, InlineEdit, InlinePicker, SelectMenu, SelectMenuOption, Fab, SpeedDial, SpeedDialItem, Scrim, Icon (Material `add`, `remove`), Text.

Behaviour & rules:
- The group name is an `InlineEdit` (click to edit, Enter/blur commits, Escape cancels); an unnamed new group shows the "Enter name" prompt.
- Both the key-value block and the company list are `DataGrid`s of `RowLabelCell` + `GridValueCell` rows (the key-value one has no header, so its two tracks are given with `columns`).
- "Previous Versions" is an `InlinePicker` opening a `SelectMenu` of versions (09/21/2026 | V-2, 09/14/2026 | V-1); only public groups with a name show it.
- Company, Symbol and Capital IQ ID are read-only calculated cells (drawn black in the frame, not blue/green). The comparables (Alphabet, Meta) are public Capital IQ entities, not portfolio companies, so they are not read from the company database.
- The FAB opens a speed dial over a scrim; "Add public comp group" / "Add transaction comp group" append an empty group of that kind. Clicking the scrim or the FAB closes it.
- "Delete group" is a secondary `tone="negative"` button and removes the group locally; "Save" (positive primary) persists.
- Empty state: a new transaction group shows only Name + "Add comparable transaction".

## Cross-platform links
- In: user menu → Comp Groups (shell overlay); company Valuations (market approach) pick these groups.
- Out: none in the prototype (Add comparable company / transaction would open a search picker — not drawn).

## Gaps & open questions
- No confirmation on "Delete group" in the frames; per AI-GUIDE a `ConfirmationDialog` should guard it — not drawn, not built.
- The "Add comparable company" picker (Capital IQ search) is not in the Figma file, and there is no public-comps dataset in the db.
- V-1 / 09/14/2026 version entry is invented to make the picker usable.
