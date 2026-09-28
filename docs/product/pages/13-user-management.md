# 13 · User Management

Firm admins manage who can use the firm's Scalar workspace: each user's role and Edit/View access per fund and company, plus bulk add, invite and removal.

## Screens

### User Management — `/admin/users`
Left: the selected user's profile (avatar, role selector, email, last login) and a permission matrix — Funds (Low Class, VIP FUND) and every company, each with Edit and View. Right: "User Permissions" — Save, Bulk add, Invite user, Manage company users, an email filter and the users table (Email, Last Login, ⋯). Clicking a row selects that user; ⋯ opens the Row Action Toolbar.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [User Management — Firm Admin detail](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-19113) | 19:19113 | `#/admin/users` |
| analyst-row-actions | [User Management — Analyst selected, row actions](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-28790) | 19:28790 | `#/admin/users?state=analyst-row-actions` |

Components used: AppFrame, Heading, ProfileHeader, RoleSelector, MenuPanel, SubmenuItem, PermissionMatrixRow, Button, ButtonIcon, FloatingLabelInput, DataGrid, ColumnHeader, Row, Cell, RowActionToolbar, ConfirmationDialog, Icon, Text.

Behaviour & rules:
- Default selection is the signed-in Firm Admin; the analyst state selects scalar@spatical.com with its row toolbar open.
- Role selector opens a menu (Firm Admin, Analyst, Auditor, Company User); changing it marks the page dirty.
- Edit implies View: ticking Edit ticks View and locks it (DS PermissionMatrixRow behaviour). All access defaults to on.
- Save (primary, positive) is disabled until a role or permission changes.
- Filter users by email narrows the table as you type; no match shows a one-line message.
- Row actions: Edit user, Resend invite, Delete user (destructive, last) and close. Delete asks for confirmation ("Delete user") and removes the row.
- "Manage company users" goes to a company's Overview (company-level user access lives there).

## Cross-platform links
- In: avatar → user menu → Firm Settings / admin (UserMenuOverlay, owned elsewhere); Global Search → "User Management" and the "Invite user" firm action.
- Out: Manage company users → `/companies/abc-co/overview`.

## Gaps & open questions
- Figma's column headers are Grid Column Header (sortable, resizable); DataGrid + ColumnHeader used because GridColumnHeader takes no width style.
- Figma's Save and ⋯ controls are Size S; the Save uses M (size S is grid-only), the row ⋯ keeps S as grid furniture.
- The ⋯ glyph in Figma is a horizontal meatball; the package only has MoreVertical.
- Bulk add, Invite user and Filter (advanced) have no Figma frames for their dialogs, so they do nothing yet. The Figma tooltip "More" on the ⋯ button is a hover state, not rendered statically.
- User names other than the signed-in user are invented from the emails.
