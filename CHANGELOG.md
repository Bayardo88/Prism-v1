# Changelog

## Unreleased
- **AI gradient tokens** — `--color-gradient-ai-{violet|blue|teal|pink}` (`color.gradient.ai.*`), Light + Dark, the AI fill
  plus the teal and pink (and blue) of Global Search, as their own tokens, not PRISM (R11). In the contrast gate at 3:1 on
  page and surface. In Figma as *Semantic: Color › Gradient/AI/\** (published 2026-10-23; known gap 15).
- **`AiOutline`** — a 2px outline in the AI gradient whose colours orbit it every 6s while AI works (`active`), following
  the corners with no seam (`@property` angle on a conic gradient); still when inactive or under reduced motion. `asChild`
  puts it on your own element. Story *Feedback › AiOutline* checks the motion in the browser; guide `docs/ai-outline.md`
  and Storybook page *Feedback › AiOutline spec*. Figma: **AI Outline** (components file, page 24), plus the proposed
  **Notification Item** and **Notification Panel** (page 25) behind the Notifications Center prototype.
- **`Toast` dismiss button** — the × now takes the toast's ink (`--toast-ink`) instead of the main tone's brand ink, which
  was 1:1 on the brand (info) fill and about 1.1:1 on an AI fill (R3). Hover and press darken the fill (`overlay.subtle`). New story
  *Toast (dismissible)* checks the computed colour in the browser, because axe's contrast rule skips icon-only controls.
- **Deal tokens** — `--color-deal-{background|text|subtle|subtle-text|control}` (`color.deal.*`), Light + Dark, aliasing the Teal
  scale (Figma "Accent"), in the contrast gate. Added to the tokens file as *Semantic: Color › Deal/\** (known gap 14).
- **Workboard Valuation modal** — `ValuationModal`, `ValuationSummary`, `ValuationPanel`, `FigureList`, `StepAssignMenu`,
  `StatusTrigger`, `AssigneeCard`, `AssigneeAvatars`, `NoteCard`, `NoteComposer`, from the workboard Figma "Assign users form
  Modal" (532:16434). `DealCard` gains `tone="deal"` and `contractAction`; `SegmentedControl` gains `variant="outline"`, `count`
  and `fullWidth`; `RichTextToolbar` gains `formats` and a Numbered list; `Modal` gains `size="2xl"` (1308px). The small
  checkbox box now uses Radius/XS, as Figma CheckboxItem S does.
- **Documentation** — AI-GUIDE (§5 intents, §7 Modal 2xl, SegmentedControl outline, RichTextToolbar formats),
  `docs/components.md` (Workboard 20, with Figma nodes), README / ONBOARDING (counts, Storybook, adding a new
  token), known gap 14 (Deal published; frames pending) and a Storybook page, *Workboard › Valuation Modal spec*.
- **Storybook MDX tables** — `remark-gfm` (dev dependency) is now wired into `@storybook/addon-docs`, so pipe tables in
  the MDX spec pages render; the *Prism Table spec* page's tables were showing as raw text.
- `StepAssignMenu`'s assign button names itself from its content, so the visible initials are part of its name
  (WCAG 2.5.3); controls inside an inverse `AssigneeCard` take Text/Inverse.
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
