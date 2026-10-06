# Remediation status (audit → implementation)

Branch `chore/audit-remediation` · baseline audit 2026-10-06 · implementation + re-audit 2026-10-06.
Plan: `Scalar-DS-Implementation-Plan.md` (outside the repo). Nothing here is committed yet — review the diff, then commit in logical PRs.

## Result

| Metric | Baseline | After |
|---|---|---|
| Components scored | 173 | 196 (finer-grained: new parts like `TabPanel`, `MenuGroup`, `RadioGroup`, `PermissionMatrix`) |
| Ready as-is (by LOC) | 58% | 99% |
| Usable with gaps | 39% | 1% |
| Needs rework | 4% | 0% |
| Avg score (LOC-weighted) | 80 | 92 |
| High-severity gaps | 43 | 0 |
| Medium / low gaps | 190 / 496 | 63 / 220 |
| A3 keyboard & focus | 65% | 91% |
| R6 ref + props passthrough | 28% | 95% |
| D2 composition | 62% | 92% |
| Tests | 0 | 714 (55 files) |
| CI / ESLint (hooks + a11y) | none | `.github/workflows/ci.yml` / enforced in `npm run verify` |

**Caveat:** the re-audit used fresh reviewer instances with the same rubric, reading the code (they did not run it). Treat the scores as
directional, and expect real assistive-technology testing (below) to find more. Fixes made *after* the re-audit (Slot disabled bypass,
`getFocusable` visibility, Tooltip description target, controlled/uncontrolled warning, Dropzone `accept`/`multiple`) are not reflected in the scores.

## Verified

`npm run verify` (tsc + token lint + ESLint + 714 tests) · `npm run build` · `npm run verify:product` (103 frames) · `npm run build:examples` ·
`npm run pack:smoke` (installs the packed tarball in a clean project, typechecks a consumer file, server-renders) · `npm run build:storybook` ·
browser pass over 12 product routes with zero console errors.

## Plan status

| Phase | Status |
|---|---|
| D-1 / D-2 decisions | Done — in-house hooks, keep `forwardRef` (`docs/decisions/0001-behaviour-layer.md`) |
| 0 Safety net | Done: CI workflow, ESLint, Vitest + axe, tests for every component, PR template, CODEOWNERS, Storybook. **Not done:** branch protection (GitHub setting), deleting the stale remote branch `cursor/valuation-company-light-mode-5acc` (outward action — yours to confirm), Prettier is configured but not enforced / not applied |
| 1 Primitives | Done: `Slot`/`asChild`, `useOverlay`, `useRovingFocus`, `useFieldIds`, `useEvent`, `useLatestRef`, `VisuallyHidden`, `composeRefs`, `useControllableState` fix. `useMenu` became `useMenuKeys` in `actions-menus` (local to that folder) |
| 2 Bug fixes | Done (all 12) |
| 3 Keyboard & focus | Done: overlays, menus, tabs, date picker, tree, table-vs-grid decision (`DataGrid` is now `role="table"`: no cell edits in place) |
| 4 Passthrough / `asChild` | Done for every component. `asChild` on `Button`, `AIButton`, `Link`, `Chip`, `Card`, `CardItem`, `MenuItem` and the header link/button rows |
| 5 DX | Done: Storybook with ~390 stories + render smoke tests, `docs/getting-started.md`, `CONTRIBUTING.md`, changesets, packaging smoke, size-limit script, `CHANGELOG.md`. **Not done:** Tailwind preset (only needed if the team uses Tailwind), per-component entry points, release automation workflow |
| 6 Verification | Re-audit done. **Not done:** manual VoiceOver/NVDA pass, visual regression, profiler pass |

## Behaviour changes devs will notice (breaking or visible)

- `Alert` / `Toast`: variant prop is now `tone` (old string `style` still works, `@deprecated`).
- `DataGrid`: `role="table"` and needs `label` (or `aria-labelledby`). `RowLabelCell` with `expanded` needs `onToggle`.
- `ComboboxPanel` no longer autofocuses — pass `autoFocus`. `SelectMenu` takes a tab stop.
- `CellHistoryPopover` takes focus on mount (pass `autoFocus={false}` in galleries). `NotificationCenter` only manages focus when `onClose` is passed.
- `ToolSwitch` is a `radiogroup`; `ColumnItem` is a toggle button; `SearchResultRow` is a `div role=option`; `SectionSubMenu` is a nav (not `role=menu`); `CompanyInfo` title is an `h1` by default.
- `ColumnHeader` shows a neutral sort glyph on unsorted sortable columns.
- `GridColumnHeader`: resize handle removed; reorder via `onMove` + arrow-key handle.
- `Modal` `role` can be `alertdialog`; `ConfirmationDialog` opens on Cancel when destructive.
- `scripts/gen-icons.mjs` now emits glyphs that accept SVG props (output verified identical to the committed file).

## Found while verifying (not caused by this work)

- Unchecked `Radio` shows its centre dot (the dot is always rendered and nothing hides it unless unchecked). Visible in the demo gallery; the original code does the same. Decide with design before changing.
- `CopyField secret` reveals the first 10 characters by default (`revealPrefix`).

## Open items from the re-audit — medium severity (63)

| Component | Crit. | File:line | Issue |
|---|---|---|---|
| SpeedDial | A3 | `components/actions-menus/Actions.tsx:263` | Esc/Up/Down handled only by keydown on the menu element; with focus on the FAB trigger (and autoFocus off by default) Esc does nothing and arrows cannot enter the menu; n |
| ViewTab | A3 | `components/actions-menus/Actions.tsx:404` | Kebab and close buttons are tabIndex=-1 and reachable only via Shift+F10/Menu/Delete shortcuts that are not advertised (no aria-keyshortcuts or hint); Delete closes a tab |
| ViewTabBar | A4 | `components/actions-menus/Actions.tsx:458` | role=tablist is an empty zero-size element that aria-owns tab buttons living in a different subtree (wrapped in generic spans); fragile across screen readers and the tabl |
| MenuItem | A6 | `components/actions-menus/Menu.tsx:84` | asChild branch only sets aria-disabled; onClick is still passed so a disabled asChild item (e.g. router link) still activates |
| ContextMenu | A3 | `components/actions-menus/Menu.tsx:144` | Surface only: no outside-click dismissal, no focus restore, and Esc/arrows only work when focus is already inside; every consumer must rebuild the menu-button behaviour |
| UserMenu | A3 | `components/actions-menus/Menu.tsx:186` | Same surface-only limitation as ContextMenu: no outside click or focus return; depends on caller |
| DirectoryGroup | A1 | `components/admin/Admin.tsx:280` | Every letter is a <section aria-label> = a region landmark; 26 landmarks flood the landmark list |
| AIButton | A6 | `components/button/AIButton.tsx:66` | Same asChild blocked-click hole as Button: child handler runs via Slot.mergeProps even when loading/disabled |
| Button | A6 | `components/button/Button.tsx:111` | asChild + disabled/loading: Slot.mergeProps runs the child's own onClick before the Slot handler, so a child <a onClick> still fires while the button is 'blocked' (only t |
| ChartCanvas | D2 | `components/charts/ChartCanvas.tsx:46` | Only 4 plugin hooks are delegated (DELEGATED_HOOKS); any other hook on a plugin passed through build() (afterEvent, afterInit, beforeUpdate, etc.) is silently dropped bec |
| LineChart | A2 | `components/charts/LineChart.tsx:84` | Series identity rests on colour + legend even with 3+ series; series.ts:7-11 says these charts MUST carry direct labels or texture (Series 2/3 CVD clash) and seriesAccess |
| CheckboxItem | A2 | `components/checkbox/CheckboxItem.tsx:8` | Props allow an unlabeled checkbox (only JSDoc asks for aria-label); Checkbox enforces it, CheckboxItem does not |
| CheckboxItem | R6 | `components/checkbox/CheckboxItem.tsx:50` | className lands on the drawn <span>, not the input or a wrapper, unlike Checkbox/Radio/Switch (label) |
| Tooltip | A4 | `components/core/Tooltip.tsx:67` | aria-describedby is added only while open, i.e. after focus has already landed, so many screen readers do not announce the description |
| DataReviewCard | A1 | `components/disclosure/DataReviewCard.tsx:51` | Title is a Typography whose default element is <p> rendered inside the <button>; block content in a button is invalid HTML |
| DataReviewCard | A2 | `components/disclosure/DataReviewCard.tsx:76` | Accept/Reject buttons have identical names on every card and the article has no accessible name |
| Drawer | D3 | `components/disclosure/Drawer.tsx:65` | No portal; fixed drawer is rendered in place and can be clipped/stacked by ancestors |
| Drawer | A2 | `components/disclosure/Drawer.tsx:76` | Header with an empty <h2> and Close renders even when title is absent; dialog then has neither a name nor a sensible heading |
| WorkspaceDrawerTab | A4 | `components/disclosure/WorkspaceDrawer.tsx:48` | If the consumer passes `id` on the active tab, the panel's aria-labelledby (activeTabId) points to a non-existent id |
| WorkspaceDrawer | R2 | `components/disclosure/WorkspaceDrawer.tsx:107` | Effect reads DOM (aria-selected) then sets state and mutates tabIndex; runs after every render because `tabs` is a fresh node, derived-from-DOM state |
| WorkspaceDrawer | A4 | `components/disclosure/WorkspaceDrawer.tsx:140` | aria-labelledby depends on activeTabId which breaks with a custom tab id (see WorkspaceDrawerTab) |
| Spinner | A6 | `components/feedback-patterns/Status.tsx:101` | role=status carries only an aria-label and no text content; live-region announcement is unreliable |
| Toast | A6 | `components/feedback/Toast.tsx:38` | No auto-dismiss or pause-on-hover/focus implemented; JSDoc leaves timing (WCAG 2.2.1) to every consumer |
| TreeItem | R1 | `components/files/Files.tsx:149` | tabindex, aria-posinset and aria-setsize are written to the DOM with setAttribute outside React (lines 149-167, 230, 272); React-owned props and imperative edits can dive |
| TreeItem | D2 | `components/files/Files.tsx:185` | No Tree/role=tree container is exported; consumers hand-write role=tree and an aria-label, and keyboard handling silently no-ops without it (line 223-224) |
| TreeItem | R2 | `components/files/Files.tsx:199` | Dependency-less layout effect runs for every item on every render and rescans the whole tree (querySelectorAll per item, O(n^2)); plus an unmount microtask rescans again  |
| TreeItem | Q4 | `components/files/Files.tsx:199` | Large trees (hundreds of rows) pay full-tree DOM scans per item per render |
| DatePicker | D4 | `components/form-controls/DatePicker.tsx:80` | `new Date()` evaluated at first render when `today` is omitted: server/client output differs around midnight/timezones (only mitigated if consumer passes `today`) |
| RadioGroup | A2 | `components/form-controls/Radio.tsx:18` | role=radiogroup can be rendered with neither `label` nor aria-label; not enforced by the type |
| Switch | A2 | `components/form-controls/Switch.tsx:21` | SwitchProps explicitly does not enforce a visible label or aria-label (comment cites Overlays.tsx); unlabeled switches compile |
| NumberField | A2 | `components/form-patterns/Fields.tsx:138` | `label` is optional and nothing in the type forces aria-label when it is omitted |
| TimeField | A2 | `components/form-patterns/Fields.tsx:201` | label optional, no compile-time name requirement |
| CopyField | R5 | `components/form-patterns/Fields.tsx:389` | `secret` masking shows the first revealPrefix=10 characters of the secret by default (and the input's value exposes them to AT) |
| Dropzone | R5 | `components/form-patterns/Pickers.tsx:487` | `accept` and `multiple` are only applied to the hidden file input; dropped files bypass them and are all passed to onFiles |
| InlineEdit | R6 | `components/form-patterns/Pickers.tsx:647` | Consumer onBlur/onChange/onKeyDown/onClick in ...rest are silently overwritten by internal handlers placed after the spread |
| InlinePicker | A4 | `components/form-patterns/Pickers.tsx:701` | aria-haspopup="listbox" is hard-coded while the JSDoc says it may open a MenuPanel; aria-controls/expanded rely on the consumer |
| AITool | R5 | `components/header/Controls.tsx:430` | Props are ButtonHTMLAttributes yet in state='input' they are spread onto an <input> and a consumer onChange is silently overwritten (line 486) |
| AITool | R6 | `components/header/Controls.tsx:459` | forwardRef typed HTMLButtonElement & HTMLInputElement (an impossible element) and className goes to the <form> in input state |
| MenuPanel | D4 | `components/header/Menus.tsx:124` | useLayoutEffect used directly warns on the server in React 18 (Files.tsx uses useIsomorphicLayoutEffect) |
| FormField | A5 | `components/input/FormField.tsx:73` | Docs claim required/aria-invalid are wired 'via props for custom ones', but cloneElement only passes id, state and aria-describedby; `required` and aria-invalid reach onl |
| Input | A2 | `components/input/Input.tsx:7` | InputProps does not require an accessible name; a bare <Input/> compiles and is unlabeled |
| Input | R6 | `components/input/Input.tsx:41` | `className` lands on the wrapper div while ref/rest go to <input>; every other form control that wraps does the same thing differently (Checkbox: label; CheckboxItem: spa |
| Select | A2 | `components/input/Select.tsx:8` | No compile-time accessible-name requirement |
| Select | R6 | `components/input/Select.tsx:37` | className goes to wrapper, rest to <select> |
| Textarea | A2 | `components/input/Textarea.tsx:6` | No compile-time accessible-name requirement |
| Textarea | R6 | `components/input/Textarea.tsx:38` | className goes to wrapper, rest to <textarea> |
| Modal | D3 | `components/modals/Modal.tsx:62` | Rendered inline with no portal: position:fixed layer is clipped/mis-stacked by transformed or overflow ancestors and sits inside the caller's DOM |
| Modal | A2 | `components/modals/Modal.tsx:75` | Header (title + Close button) renders only when `title` is set; without title or aria-label the dialog is unnamed and has no visible close control |
| Breadcrumb | R5 | `components/navigation/Breadcrumb.tsx:10` | onClick is () => void and drops the event, so SPA callers cannot preventDefault on an <a href> item (line 64) |
| Pagination | R6 | `components/navigation/Pagination.tsx:164` | With rowsPerPage the ref, className and ...rest move from <nav> to a wrapper <div>; the root element type changes with props |
| TabItem | A3 | `components/navigation/Tabs.tsx:50` | tabIndex is -1 unless `active`; if no tab is active (or consumer forgets) the tablist has no tab stop and is unreachable by keyboard |
| Tabs | D4 | `components/navigation/Tabs.tsx:84` | A Tabs nested inside a TabsGroup panel reuses the outer id base, so equal `value`s produce duplicate ids |
| SettingRow | R6 | `components/overlays/Overlays.tsx:89` | Props do not extend native attributes: no id, aria-*, data-* or style passthrough; ref goes to the input but nothing else reaches the root |
| GlobalSearch | A3 | `components/search/GlobalSearch.tsx:146` | Scope push/pop is keyboard-only (Tab/Backspace); chips are not clickable so pointer/touch users cannot scope; input has outline:none (components.css:1081) with no focus-w |
| GlobalSearch | Q3 | `components/search/GlobalSearch.tsx:149` | String(active.title) on a ReactNode title yields '[object Object]' for non-string titles in the scope label |
| DataGrid | R5 | `components/table/DataGrid.tsx:59` | Column tracks are derived by cloning-inspecting each header element's props (grow/width/span); a header wrapped in your own component, memo or fragment-less helper silent |
| Footnote | A1 | `components/table/Footnote.tsx:42` | Non-interactive branch spreads onClick onto the <sup> (a clickable non-focusable, role-less element) |
| Row | D1 | `components/table/Row.tsx:4` | RowType includes 'readable'/'input'/'data' but only 'total' and 'divider' affect the output (line 43-48); the other values are accepted and do nothing |
| Row | Q2 | `components/table/Row.tsx:20` | JSDoc says type='readable' is used for locked periods and that cells inherit the type, but Row passes nothing to its cells |
| Slot | D2 | `utils/Slot.tsx:15` | Child handler runs first and the slot handler still runs after a child preventDefault; there is no way for a slot handler (e.g. a Button's 'blocked' guard) to suppress th |
| getFocusable / FOCUSABLE_SELECTOR | A3 | `utils/focus.ts:10` | Visibility is not checked (only [hidden]/aria-hidden/inert): display:none and visibility:hidden descendants count as tabbable, so the modal trap can focus invisible eleme |
| composeRefs / setRef | Q4 | `utils/refs.ts:11` | composeRefs returns a new callback each call and is invoked inline in render at Fields.tsx:344, Pickers.tsx:177/374/644/662 and Slot.tsx:50 without useMemo, so refs detac |
| useControllableState | R3 | `utils/useControllableState.ts:14` | Controlled is detected by `value !== undefined`, so a controlled value that becomes undefined silently flips to uncontrolled with no warning, and onChange fires even when |

Low-severity items (220) are API polish (exported literal unions, casts, i18n strings) and live in the re-audit data.
