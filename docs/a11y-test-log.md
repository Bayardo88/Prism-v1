# Assistive-technology test log

Automated checks (axe in 780 unit tests and 384 story tests, contrast and reflow gates)
catch roughly a third of real problems. This log records the **manual** passes. Nothing
below has been run yet: the rows are the test plan, and an empty "Result" means untested.

Script per widget: reach it with Tab only, operate it with Enter/Space/Arrows/Escape, confirm
the screen reader announces name, role, state and value, and that focus returns sensibly.

| Widget | VoiceOver (Safari) | NVDA (Firefox) | Date | Tester | Issues |
|---|---|---|---|---|---|
| Menu / MenuItem | | | | | |
| Tabs | | | | | |
| Select / Combobox | | | | | |
| Date picker | | | | | |
| Tree / WorkspaceDrawer | | | | | |
| Modal / Drawer / ConfirmationDialog | | | | | |
| Tooltip / Popover | | | | | |
| DataGrid (`role=table`) | | | | | |
| NotificationCenter | | | | | |
| Toast / Alert | | | | | |
| Charts (title + hidden data table) | | | | | |
