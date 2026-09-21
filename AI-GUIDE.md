# Scalar Design System — AI Build Guide

**Read this file before writing any Scalar product UI.** It is the complete
contract: the rules, the decision tables ("railroads"), and the component API.
If a rule here conflicts with a screenshot, a mockup, or an older page in the
repo, **this file wins** — most pre-v1.1 screens were built against the old
primitive tokens and are not a reference.

- **Source of truth:** `Scalar_Design_System-v1.1` (tokens, Figma file
  `anrnTIJKgu27zV224h7vON`) and `Scalar_Design_System-Components` (Figma file
  `Z4MtKOfkNEzhMYJzN1q3kR`).
- **Scale:** 421 design tokens · 88 components · Light + Dark · 3 type modes.
- **Verify your work:** `npm run verify` (typecheck + token-contract lint).

---

## 0. Setup — do this once per application

```tsx
import '@scalar/design-system/styles.css';
import { ScalarProvider } from '@scalar/design-system';

export default function App() {
  return (
    <ScalarProvider mode="system" viewport="auto">
      <YourApp />
    </ScalarProvider>
  );
}
```

`mode` is `light | dark | system`. `viewport` is `desktop | desktop-large |
mobile | auto` and selects the **type ramp**, not the layout.

Everything else imports by name from the package root:

```tsx
import { Button, DataGrid, Cell, color, space, type } from '@scalar/design-system';
```

---

## 1. The hard rules

These are the system's own rules (R1–R13), restated for code. Breaking one is a
bug, not a style preference.

| # | Rule |
|---|------|
| **R1** | Never use a `--primitive-*` token in product code. They have no mode and will not respond to the theme. Use a semantic token. |
| **R2** | Colour from `color.*`. Type from `type.style()` or a `scalar-type-*` class. **Gap and padding** from `space.*`. Radius from `radius.*`. **Width and height** from `size.*`. Never cross `space` and `size`. |
| **R3** | Every filled surface has a matching on-colour. `bg.brand` pairs with `text.onBrand` and `icon.onBrand`. **`text.primary` on a filled surface is a contrast bug.** |
| **R4** | Yellow is the exception. `bg.warning` is identical in both modes and `text.onWarning` is near-black in both. White can never clear AA on yellow. |
| **R5** | `stroke.default`, `stroke.subtle` and `stroke.divider` are non-interactive **container** edges (~1.2–1.7:1, allowed — WCAG 1.4.11 covers components, not containers). Anything clickable, focusable or typable takes `stroke.control`, which clears 3:1. |
| **R6** | The type ramp has three modes: Desktop (1440, default), Desktop Large (1920), Mobile (393). Set it on `ScalarProvider`. **Never hand-resize type.** |
| **R7** | Weight is orthogonal to size. Changing weight never moves size, line-height or tracking. |
| **R8** | **Colour alone never carries meaning.** Status needs an icon or words. Chart series need direct labels. Links need a permanent underline. |
| **R9** | Elevation is a ladder: `raised` < `overlay` < `modal`. Shadow colours are token-bound and deepen automatically in Dark. |
| **R10** | **Text floor is 12px.** Display is marketing-only. Uppercase labels use the Overline role, which owns the +0.8px tracking — never set `letterSpacing` yourself. |
| **R11** | PRISM says what an item **represents** — never access, availability or permission. |
| **R12** | 33 of the 78 type tokens are identical across all three modes. That is intentional. Do not "fix" them. |
| **R13** | If you add a `bg.*` or a PRISM concept, re-run the contrast matrix against Page, Surface, Surface Raised and Subtle before shipping. |

---

## 2. Railroad — "I need a colour"

Never pick a colour by eye. Find the row that matches the **job**.

| The job | Use | Never use |
|---------|-----|-----------|
| Body text on a page | `color.text.primary` | a primitive, `#0f172a` |
| Supporting / secondary text | `color.text.secondary` | opacity on primary |
| Labels, captions, metadata | `color.text.tertiary` | a lighter grey you picked |
| Text on a **filled** brand surface | `color.text.onBrand` | `color.text.primary` (R3) |
| Text on a filled **yellow** surface | `color.text.onWarning` (near-black) | white (R4) |
| A primary action's fill | `color.bg.brand` + `text.onBrand` | `bg.brandSubtle` |
| A destructive action's fill | `color.bg.negative` + `text.onNegative` | brand recoloured by hand |
| A status **tint** (pill, badge, alert ground) | `color.bg.*Subtle` + matching `color.text.*` | a saturated fill with 12px white text |
| A card or panel surface | `color.bg.surface` | `bg.page` |
| A surface lifted above another surface | `color.bg.surfaceRaised` | a lighter hex |
| The page itself | `color.bg.page` | `bg.surface` |
| A zebra stripe / hover ground | `color.bg.subtle` | opacity |
| A **container** edge (card, divider, table frame) | `color.stroke.default` / `.subtle` / `.divider` | `stroke.control` |
| An **interactive** edge (input, checkbox, anything clickable) | `color.stroke.control` | `stroke.default` (fails 3:1) (R5) |
| A keyboard focus ring | `color.stroke.focus`, 2px, **outside** | a coloured box-shadow |
| An icon beside body text | `color.icon.secondary` | `text.tertiary` |
| An inline link | `color.text.link` + permanent underline | `text.brand` with no underline (R8) |
| A chart series | `chart.series[i]`, assigned in order | cycling, or hand-picked hexes |
| "What kind of thing is this?" in search / nav | a PRISM token — see §6 | `text.brand` |
| A scrim behind a modal | `color.overlay.scrim` | `rgba(0,0,0,.5)` |

**Hover and pressed are tokens, not filters.** `bg.brandHover`,
`bg.brandPressed`. Never `filter: brightness()` or an opacity change.

---

## 3. Railroad — "I need a size or a space"

Two scales that must never be crossed (R2).

**`space.*` — gap and padding only.**

| Token | Value | Typical use |
|-------|-------|-------------|
| `space['2xs']` | 2px | icon-to-text in dense grid furniture |
| `space.xs` | 4px | inside a chip or badge |
| `space.s` | 8px | between a label and its control |
| `space.m` | 12px | card padding, menu row padding |
| `space.l` | 16px | between related blocks |
| `space.xl` | 24px | between sections |
| `space['2xl']` | 32px | around an empty state |
| `space['3xl']` · `space['4xl']` | 48 · 64px | page-level rhythm |

**`size.*` — width and height only.**

| Token | Value | Use |
|-------|-------|-----|
| `size.icon.xs … xl` | 12 · 16 · 20 · 24 · 32 | every icon. Never hand-size one. |
| `size.control.s / m / l` | 32 · 40 · 48 | button and field heights |
| `size.avatar.xs … xl` | 24 · 32 · 40 · 56 · 80 | every avatar |
| `size.row.compact` | 26px | data-grid row min-height |
| `size.target.minimum` | **44px** | the tap target floor |
| `size.target.dense` | 24px | documented exception: dense grid only |

**`radius.*`** — `2xs` 2 (grid cells) · `xs` 4 (buttons, chips, inputs-in-bar) ·
`s` 8 (fields, cards, modals) · `m` 16 (large panels) · `full` (avatars, pills).

**Targets.** Every interactive control reaches `size.target.minimum` (44px) even
when the drawn box is smaller. The exception is dense grid furniture, which
cannot and is documented as such in `docs/known-gaps.md`.

---

## 4. Railroad — "I need type"

Pick a **role** by job, then a **step** by prominence. Never pick a role because
it happened to be the right size.

| Role | What it is for | Steps |
|------|----------------|-------|
| `display` | **Marketing only.** Never in product UI. | s · m · l |
| `heading` | Section and page titles, table column headers | s · m · l · xl · 2xl · 3xl · 4xl · 5xl |
| `text` | Body copy, table cell content | s · m · l · xl · 2xl |
| `label` | Form labels, button labels, compact UI furniture | s · m · l |
| `link` | Inline links — tracks body text without a heading's tracking | s · m · l |
| `overline` | Uppercase group labels. **Owns +0.8px tracking.** | s · m |

```tsx
// Preferred — the semantic components:
<Heading level={1} step="3xl">Valuation summary</Heading>
<Text step="m" tone="secondary">Last reviewed 14 months ago.</Text>
<Overline>Companies</Overline>

// When you need the raw CSS (e.g. for a third-party component):
<div style={type.style('heading', '2xl', 'semiBold')} />
```

**The floor is 12px (R10).** There is no step below it. If a design shows 10px
or 11px text, it predates v1.1 — raise it to 12 and expect the layout to reflow.

**Never set `letterSpacing`.** The Overline role carries its own tracking, and
setting it by hand detaches the step.

---

## 5. Railroad — "I need a component"

Find the **intent**, not the shape.

| Intent | Component | Not this |
|--------|-----------|----------|
| Run an action | `Button` | `Link` |
| Navigate somewhere | `Link` | `Button` |
| Run an action with an unambiguous glyph only | `ButtonIcon` (`label` required) | `Button` with no text |
| Start a generative action | `AIButton` / `AITool` | a purple `Button` |
| Ask for one short value | `FormField` + `Input` | a bare `Input` |
| Ask for long free text | `FormField` + `Textarea` | a tall `Input` |
| Pick one of **≤7** options | `Radio` group | `Select` |
| Pick one of **>7** options | `Select` | a long `Radio` group |
| Toggle a setting that applies **at once** | `Switch` | `Checkbox` |
| Toggle a setting that needs **Save** | `Checkbox` | `Switch` |
| Pick a date near today | `DatePicker` | a typed field alone |
| Pick a far-off date | a typed field **plus** `DatePicker` | `DatePicker` alone |
| State a fact about an item | `Chip` | `Button` |
| Show a count or marker | `Badge` | `Chip` |
| Show the state of a valuation's **work** | `ModalStatus` | `Chip` |
| Show the state of a **deal** | `ValuationStatus` | `ModalStatus` |
| Switch between peer views of one thing | `Tabs` | `Stepper` |
| Move through an ordered process | `Stepper` | `Tabs` |
| Page through records | `Pagination` | `Tabs` |
| Show where the page sits in the hierarchy | `Breadcrumb` | a back button |
| Message the user must act on | `Alert` (inline, persistent) | `Toast` |
| Acknowledge something that already happened | `Toast` (transient) | `Alert` |
| Focused task, page stays visible | `Drawer` | `Modal` |
| Task needing full attention, must finish first | `Modal` | `Drawer` |
| Secondary detail on a dense page | `Accordion` | a `Modal` |
| Surface with nothing in it | `EmptyState` | a blank div |
| Content not loaded yet (first load, known shape) | `Skeleton` | a spinner |
| Progress of a task with a known total | `ProgressBar` (determinate) | indeterminate |
| A dense grid of figures | `DataGrid` + `Row` + `Cell` | an HTML `<table>` |
| Explain the control under the pointer | `Tooltip` | placeholder text |
| Search everything, from anywhere | `GlobalSearch` | a page filter |

---

## 6. PRISM — semantic colour for *what a thing is*

PRISM colour-codes **what an item represents**. It is used by Global Search and
by navigation.

> **PRISM never states whether the user may open a thing.** Access,
> availability and permission are not its job (R11).

Nine types, in five families:

| Family | Type | `data-prism` | Meaning |
|--------|------|--------------|---------|
| Entity | Firm | `firm` | an organisation you work for |
| Entity | Company | `company` | a portfolio company |
| Data | Document | `document` | a file |
| Data | Version | `version` | a valuation version |
| Data | Measurement Date | `measurement-date` | an as-of date |
| Destination | Page | `page` | somewhere you land |
| Command | Firm Action | `firm-action` | a command at firm level |
| Command | Company Action | `company-action` | a command at company level |
| Utility | Neutral | `neutral` | the fallback |

Each type has exactly three tokens, and they are **not interchangeable**:

| Token | Use for | Never use for |
|-------|---------|---------------|
| `…-primary` | **graphic only** — a swatch, dot or glyph | text |
| `…-background` | the tint behind a tile or badge | text |
| `…-text` | **the only one safe for small text** | large filled areas |

In CSS, set `data-prism="<type>"` on an element and the three custom properties
`--prism-primary`, `--prism-bg` and `--prism-text` resolve for you.

**Scope vs destination.** Only five types are *scopable* — Firm, Company,
Document, Version, Measurement Date (`prismScopeTypes`). A Page or an Action is
somewhere you land, not something you search inside, so neither can be pushed
onto the search scope stack.

```tsx
<SearchResultRow type="company" title="Acme Inc." subtitle="Portfolio company" />
<SearchSectionHeader type="document" />   {/* renders "DOCUMENTS" */}
<SearchScopeChip type="firm">Sequoia Capital</SearchScopeChip>
```

**The inversion trap.** Older Global Search mockups colour Firm blue and Company
green. That is inverted and wrong. Firm is **yellow** (`Entity/Firm`), Company
is **brand blue** (`Entity/Company`). Build to the tokens, never to those
mockups.

---

## 7. Component API

Every component below is exported from the package root. Props marked
**required** have no default.

### Primitives

**`Icon`** — `{ size?: 'xs'|'s'|'m'|'l'|'xl', tone?, label?, children }`
Sizing and tint wrapper for a glyph. Glyphs ship from the separate
`SDS_Main icons` Figma library and are **not** in this package — export the real
glyph and pass it as children. The handful in `glyphs` are structural only
(chevrons, tick, close) and exist so this package's own components work.
Icons imported from SDS_Main default to white and are invisible on a light
surface until re-tinted; `Icon` always sets a tint, so anything through it is
safe. Pass `label` only when the icon carries meaning on its own.

**`Typography`** — `{ variant?: TypeRole, step?, weight?, tone?, as?, truncate? }`
Plus the shorthands `Heading`, `Text`, `Label`, `Overline`.
Size is `variant` + `step`, colour is `tone`, the HTML element is `as`. Keeping
those independent is what stops an `<h2>` being chosen for its size.

### Core

| Component | Key props | Notes |
|---|---|---|
| `Divider` | `orientation` | Only where whitespace fails to group. Two stacked dividers is a spacing bug. |
| `Link` | `size`, `href` | Underline is **permanent**, not a hover reveal (R8). |
| `Tooltip` | `content` **req**, `position` | Explains; never holds the only copy of something. Keyboard-reachable, Escape dismisses. |
| `Scrim` | `onDismiss` | Sibling of the dialog, never a child. |
| `EmptyState` | `title` **req**, `type`, `body`, `icon`, `actions` | `no-data` offers the filling action; `no-results` offers the way out; `error` explains and retries. Write guidance, not apology. |

### Actions

**`Button`** — `{ variant?: 'primary'|'secondary'|'tertiary', tone?: 'main'|'positive'|'warning'|'negative', size?: 's'|'m'|'l', loading?, selected?, leadingIcon?, trailingIcon?, disabled? }`

- **`variant` carries weight** (how much attention). **`tone` carries meaning**
  (what kind of action).
- A destructive action is `tone="negative"` at whatever variant its prominence
  deserves — **never** a primary button recoloured by hand.
- Hover / pressed / focus are CSS states, **not props**. There is no `state`.
- `size="s"` is dense table furniture only — never a primary action.

**`ButtonIcon`** — as `Button`, plus `icon` **req** and `label` **req**.
The glyph is not the name. Use only where the icon is unambiguous alone.

**`AIButton`** — `{ showIcon? }`. Genuinely generative actions only.

### Forms

| Component | Key props | Notes |
|---|---|---|
| `FormField` | `children` **req**, `label`, `helperText`, `state`, `required` | The default way to ask for input. Wires `id` + `aria-describedby`. In `state="error"` the helper becomes the error and turns negative — say what is wrong **and how to fix it**. |
| `Input` | `state`, `leadingIcon`, `trailingIcon` | A bare input with no label is an accessibility failure. Wrap it. |
| `Textarea` | `state`, `resizable` | Size the default height to the expected answer. If it is not resizable, set `resizable={false}` rather than leaving a decorative grip. |
| `Select` | `state` | Above ~7 options. Below that use `Radio`. |
| `Checkbox` / `CheckboxItem` | `size`, `indeterminate`, `invalid` | `indeterminate` is a **display** state for a partly-selected parent — never user-selectable. The label is part of the target. |
| `Radio` | `size`, `invalid` | Never alone: a single radio that cannot be unselected is a checkbox. |
| `Switch` | `size` | Only when the change applies **at once**. Label what it controls, never its on/off state. |
| `CalendarDay` | `day` **req**, `selected`, `today`, `outside` | Today and Selected are **never drawn the same way**. |
| `DatePicker` | `value`, `onChange`, `month`, `isDisabled` | Six week rows always, so the popover never changes height. |

### Navigation & chrome

`Tabs` + `TabItem` · `Breadcrumb` · `Pagination` + `PageItem` · `Stepper` + `Step`
`PrimaryMenu` + `MainMenuItem` · `SecondaryMenu` + `SecondaryMenuItem` ·
`TertiaryMenu` + `TertiaryMenuItem` · `CompanyInfo` ·
`MenuPanel` + `SubmenuItem` + `MenuGroupLabel` · `CompanyDropdownPanel` · `SectionSubMenu` ·
`CompanyDropdown` · `FilterDropdown` · `SearchBar` · `Notification` · `Badge` ·
`ComboTag` · `CurrencySelector` · `Selector` · `InformationLabel` · `ToolSwitch` · `AITool`

- **Three navigation tiers is the limit.** A fourth level belongs in the page
  body, not the chrome.
- Exactly one `TabItem` is `active` at all times. A tab bar with nothing
  selected is a navigation bug, not a state.
- The last `Breadcrumb` item is the current page: not a link, and it must not
  look like one.
- `Pagination` never *hides* Previous/Next — it disables them.
- `Stepper`: show every step from the start. Never mark one complete until it
  is.
- `FilterDropdown` shows **the value in force**, not the filter's name.
- `Notification`'s dot means *unread*, not urgent, and carries no count.

### Data grid

`DataGrid` · `Row` · `Cell` · `ColumnHeader` · `ContentCell` · `Footnote` ·
`Ledger` · `ModalStatus` · `ValuationStatus`

**`Cell`** — `{ type?: 'readable'|'input'|'data'|'group'|'divider', state?: 'default'|'selected'|'error'|'draft'|'total', numeric?, footnote?, icon?, groupStart?, groupEnd? }`

`type` says **what the cell holds** and drives the text colour:
`readable` → primary · `input` → editable (blue) · `data` → sourced (green).
`state` says **what has happened to it**. Use `numeric` on every money column —
it right-aligns and applies tabular figures.

```tsx
<DataGrid label="Cap table" head={<><ColumnHeader>Security</ColumnHeader><ColumnHeader numeric>Shares</ColumnHeader></>}>
  <Row>
    <Cell>Series A Preferred</Cell>
    <Cell numeric type="data">1,000,000</Cell>
  </Row>
  <Row type="total">
    <Cell state="total">Total</Cell>
    <Cell state="total" numeric>1,000,000</Cell>
  </Row>
</DataGrid>
```

The header is sticky in use — keep it in `head`, outside the scroll container.

### Charts

`BarChart` · `LineChart` · `WaterfallChart` · `DonutChart` · `ChartFrame` ·
`ChartLegend` + `ChartLegendItem` · `seriesColor` · `seriesAccessibilityWarning`

- Assign series **in order** and never cycle. A ninth series folds into "Other"
  or becomes small multiples.
- A legend is **mandatory** at two or more series. At four or fewer, direct-label
  on the chart as well.
- `BarChart type="stacked"` only when the **total** is meaningful.
- `LineChart type="area"` only for one cumulative quantity, or ≤3 series.
- **Never two y-scales on one chart.** Two magnitudes become two charts, or one
  indexed to a common base.
- Waterfall bars are **all** directly labelled — it is read as arithmetic, not
  as a shape.
- Donut ceiling is 8 slices. It answers "what is the split", never "how did the
  split change" (that is a stacked bar over time).

> ⚠️ **Open accessibility gap.** `Chart/Series` has not passed CVD validation in
> Light mode: Series 2 and Series 3 separate by only ΔE 4.9 under deuteranopia
> (floor is ΔE 6), and Series 3 shares its hex with `Chart/Negative`. Until those
> tokens are re-stepped, **any chart using three or more series must carry direct
> labels or texture in addition to the legend.** `seriesAccessibilityWarning()`
> is the programmatic guard.

### Feedback, containers, search

`Alert` · `Toast` + `ToastViewport` · `ProgressBar` · `Skeleton` ·
`Card` + `CardItem` · `Accordion` + `AccordionItem` · `Drawer` ·
`WorkspaceDrawer` + `WorkspaceDrawerTab` · `DataReviewCard` ·
`Modal` · `ColumnTitle` · `ColumnItem` · `ModalSearch` ·
`GlobalSearch` · `SearchResultRow` · `SearchSectionHeader` · `SearchScopeChip` · `KeyHint`

- `Skeleton` must match the layout it replaces. Under 300ms, show nothing.
- `ProgressBar` with no `value` is indeterminate — use it only when the total
  genuinely is unknown.
- `Modal` traps focus, closes on Escape, returns focus to its trigger.
- `GlobalSearch`: scope is a **stack**, not a filter. Tab pushes, Backspace pops.
  Never show more than three chips.

---

## 8. Anti-patterns — do not do these

| ✗ Don't | ✓ Do |
|---------|------|
| `style={{ color: '#0268c1' }}` | `style={{ color: color.text.brand }}` |
| `style={{ padding: 12 }}` | `style={{ padding: space.m }}` |
| `style={{ fontSize: 13 }}` | a `type.style()` role/step, min 12px |
| `width: space.l` | `width: size.icon.s` (R2) |
| `background: bg.brand; color: text.primary` | `color: text.onBrand` (R3) |
| white text on `bg.warning` | `text.onWarning` (R4) |
| `border: 1px solid stroke.default` on an input | `stroke.control` (R5) |
| a red dot as the only error signal | a dot **plus** words or an icon (R8) |
| `filter: brightness(0.9)` for hover | `bg.brandHover` |
| `letterSpacing: '0.8px'` for uppercase | the `overline` role (R10) |
| a `<table>` for a dense figure grid | `DataGrid` + `Row` + `Cell` |
| a `Button` that navigates | `Link` |
| a `Link` that submits or deletes | `Button` |
| `role="heading"` on `Typography` | `variant="heading"` — `role` is the DOM attribute |
| PRISM colour to show "you can't open this" | PRISM says *what it is*, never permission (R11) |

---

## 9. Before you call it done

```bash
npm run verify     # typecheck + token-contract lint
```

Then check by hand:

- [ ] No raw hex, `rgb()`, or hard-coded px in anything you wrote.
- [ ] Every filled surface uses its `on*` text token (R3).
- [ ] Every interactive edge uses `stroke.control`, not `stroke.default` (R5).
- [ ] Every interactive control reaches 44px, or is documented dense grid.
- [ ] Every status carries words or an icon, not just colour (R8).
- [ ] Focus is visible on every control, 2px `stroke.focus`, outside the box.
- [ ] It reads correctly in **both** Light and Dark.
- [ ] No text below 12px (R10).
- [ ] Charts with ≥3 series carry direct labels.

---

## 10. Known gaps — inherited, not bugs to "fix" silently

See `docs/known-gaps.md` for the full list with context. The ones most likely to
bite you:

1. **Chart CVD clash** (Series 2/3) — see §7. Direct labels are mandatory.
2. **Field height 36px** has no Semantic: Sizing step (the ramp is 32 · 40 · 48).
   Held as one named constant, `--field-height`, in the component layer.
3. **Dense grid affordances cannot reach the 44px target.** This is a documented,
   deliberate exception scoped to grid furniture only — never generalise it.
4. **Icon library is not in this package.** `SDS_Main icons` is a third Figma
   library; export glyphs from it and pass them to `Icon`.
5. **`Gradient/AI`** has no Dark-mode counterpart. Verify on `bg.page` in Dark.
