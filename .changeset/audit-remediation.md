---
'@scalar/design-system': minor
---

Accessibility and API-consistency remediation. Every component now forwards `ref` and native props and merges `className`;
`Button`, `Link`, `Chip`, `Card` and `MenuItem` accept `asChild`. Menus, tabs, date picker, tree, overlays and drawers have
real keyboard models; `Modal`, `Drawer` and popovers manage focus. New primitives: `Slot`, `useOverlay`, `useRovingFocus`,
`useFieldIds`, `useEvent`. `Alert`/`Toast` `style` is now `tone` (old string `style` still works, deprecated). `DataGrid`
needs a `label`. `ComboboxPanel` no longer autofocuses (pass `autoFocus`). `DataGrid` is `role="table"`.
