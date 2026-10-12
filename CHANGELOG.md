# Changelog

## Unreleased
- **Workflow tone tokens** — `--color-workflow-{blue|pink|cyan|orange}-{background|text|stroke|solid|on-solid}` (`color.workflow.*`),
  Light + Dark, in the contrast gate. `WorkflowTone` gains `blue | pink | cyan | orange`. Code-first from the workboard-v2 proposed
  collection, pending the Scalar tokens library (known gap 13).
- **Workboard components** — `ActionPill`, `ActionTag`, `DueDatePill`, `StepMenu` (+ sections), and now `DealCard`, `ColorPicker`,
  `WorkCalendar` + `CalendarTaskCard`, `WorkTimeline` and `PeriodToolbar`: prop-driven ports of the Workboard prototype, each with
  tests and stories under Storybook › Workboard.
- **`Cell`** — only total / sub-total cells keep the grey outline; an error cell shows its red ring only while selected; draft has none.
- **`Table`** — the one Prism table for the whole platform (Valuations, Waterfalls, Financials, Cap Table, Companies, Reports, Workboard):
  a `role="grid"` with a data contract (`TableProps`), a derived selection model drawn as one perimeter overlay, content-minimum column
  resizing with persistence, formula mode with an fx bar, spreadsheet keyboard and inline editing. Pure logic lives in
  `table/tableModel.ts`. `Cell` gains `hover` / `pressed` states; `RowHeader` gains `selected`; `ColumnHeader` gains `selected` / `active`.
  `DataGrid` is unchanged and remains the static `role="table"`. Spec: Storybook → Data/Table/Prism Table spec.
- Accessibility and API-consistency remediation from the 2026-10-06 code audit: shared primitives (`Slot`/`asChild`, `useOverlay`,
  `useRovingFocus`, `useFieldIds`), keyboard models for menus, tabs, grids, trees, date picker and overlays, `ref`/native-prop
  forwarding across the component set, tests, CI and linting. See `docs/component-contract.md`.

## 1.1.0
- Initial v1.1 token and component layer.
