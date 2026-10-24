# Known gaps

These are inherited from the v1.1 library and the component file. Each is
**deliberate and documented** — read the reason before "fixing" one, and if you
do resolve it, fix it in Figma first and re-extract.

---

## 1. Chart series CVD validation — resolved in code, pending Figma

**Status (2026-10-09): resolved in the code layer.** The eight `Chart/Series` colours
(and their `-subtle` fills) were re-stepped in `tokens.css` so every pair separates by at
least **ΔE2000 6 under normal vision, deuteranopia, protanopia and tritanopia**, in both
Light and Dark, all clear 3:1 against `Background/Surface`, and no series equals
`Chart/Negative`. `scripts/lint-contrast.mjs` (part of `npm run verify`) enforces this, so a
token edit that breaks it cannot merge. `seriesAccessibilityWarning()` now only warns past
eight series.

**Still open — Figma and code now differ.** The Figma `Chart/Series` variables still hold
the previous ramp. Update them from `tokens.css` (design sign-off needed: every chart
changes colour), then re-extract. Until then, a chart built in Figma will not match code.

Stacked bars still label the column total instead of per-segment values: there is no
per-series on-colour token, so a segment label would put dark text on a dark fill. A
`Chart/Series N/On` ramp would remove the exception.

---

## 2. Field height has no sizing token

The authored height for `Input`, `Select` and `Textarea` is **36px**.
`Semantic: Sizing` runs 32 · 40 · 48 (`Control/S`, `/M`, `/L`) and has no 36
step, so this value cannot come from a token.

**Mitigation:** held as one named constant, `--field-height`, declared once on
`.scalar-field` in `src/styles/components.css`. It is never repeated.

**Real fix:** either add a `Control/XS` at 36 to `Semantic: Sizing`, or re-author
the fields at 32 or 40.

---

## 3. Dense grid affordances cannot reach the 44px target

`Semantic: Sizing/Target/Minimum` is 44px, and every interactive control in the
system honours it — except data-grid furniture, where a row is 26px
(`Row/Compact`) and a 44px target would overlap two neighbouring rows.

**Mitigation:** grid affordances use `Target/Dense` (24px) and the
`.scalar-target--dense` helper. This exception is scoped to grid furniture and
**must not be generalised** to any other control.

---

## 4. The icon library is not in this package — resolved in code, open in Figma

**Status (2026-09-28): resolved in the code layer.** The product icon set is
now **Google Material Symbols (Outlined, weight 400)**, generated into
`src/components/icon/material.tsx` and exported as `icons`
(`<Icon><icons.Search /></Icon>`). The structural aliases in
`src/components/icon/glyphs.tsx` (`ChevronDown`, `Close`, `Trash`…) now point at
Material glyphs, so every component in this package draws Material. To add an
icon, put its Material snake_case name in
`src/components/icon/material-icons.json` and run `npm run gen:icons` — never
hand-edit `material.tsx`.

**Still open — Figma and code icons now differ.** Figma still draws glyphs from
the third library, `SDS_Main icons`, which is editable from neither of the two
files this package was generated from. A screen built in code and the same
screen in Figma will show different glyph shapes for the same meaning. Match by
**meaning**, never by shape, and do not push Material SVGs into Figma as loose
vectors. **Real fix:** swap the Figma components onto a Material Symbols
library (or publish one), then the two agree again.

Related, Figma side only: 135 glyph fills in `SDS_Main icons` resolve to
`Primitive: Color`, and icons imported from it default to `Text/On Brand`
(white), which is invisible on a light surface. In code, `Icon` always sets a
tint and Material glyphs fill with `currentColor`, so anything rendered through
it is safe.

---

## 5. `Gradient/AI` has no Dark-mode counterpart

The gradient stroke on `AIButton` and `AITool` is a paint style with no mode
support. Verify it on `Background/Page` in Dark before shipping anything that
uses it.

---

## 6. Figma counts drift from the contract text — resolved

The `TOKEN-CONTRACT.txt` frame in the tokens file used to lag the live library
(461 variables; `Semantic: Color` 144, `Radius` 7, `Sizing` 15). It was rewritten
on 2026-10-05 and now states 511 variables across 9 collections, matching the
live values — `Semantic: Color` 180, `Radius` 8, `Sizing` 22 — and this package.

The library itself is **published**: on 2026-10-05 the components file could see
all 9 collections through the team library, with 180 / 22 / 8 semantic colour,
sizing and radius variables, including `Chart/Total`, `Target/Dense`,
`Radius/2XS` and the data-grid, File and Product families. Components therefore
no longer need to wait on a republish to bind to them.

If the contract text and the live library disagree again, the live library wins:
re-extract and regenerate rather than hand-editing the generated files.

---

## 9. `cell` and `Header` are not published

**Severity: blocks assembling any data sheet in Figma from the library.**

Found 2026-09-21 while pushing a generated cap-table screen back into Figma.
`importComponentSetByKeyAsync` failed for both, and `getPublishStatusAsync()`
confirms it:

| Component | Variants | Publish status |
|---|---|---|
| `cell` | 145 | **UNPUBLISHED** |
| `Header` | 11 | **UNPUBLISHED** |
| every other component sampled, across 4 pages | — | `CURRENT` |

Re-checked 2026-10-05, **after the library was published**: the other component sets sampled (including the new pages 20–26 and `Valuation Info`) read `CURRENT`, but `cell` and `Header` are **still unpublished**. Re-run the check before assuming otherwise.

These two are the atoms of the data grid — the core Scalar screen. While they
are unpublished, a designer cannot place a data cell or a column header from the
library in any file, and the code→design push cannot fill the grid region of a
data-sheet screen.

They are also the two highest-variant sets in the file, which is the likely
cause: large variant sets are the usual thing to fail or get skipped during a
publish.

**Mitigation:** none worth having. A grid redrawn from rectangles and text looks
right in a screenshot and is worthless afterwards — it will not respond to a
token change and no variant can be swapped. The generated screen leaves the
region marked instead.

**Real fix:** publish both from the components file, then re-run the push.

This does not affect the code layer: `Cell`, `ColumnHeader` and `Row` are
generated from the component definitions, not from the published library.

---

## 8. Row grouping is modelled three different ways

`Row-reading`, `Row-input` and `cell` each express grouping with their own
boolean set (`Group`, `Start Group`, `End Group`). The code layer normalises
this onto `Row`'s `group` prop and `Cell`'s `groupStart` / `groupEnd`, and
merges `Row-reading` and `Row-input` into one `RowHeader` (the first cell of a row;
Reading's `group` and Input's `groupStart` / `groupEnd` are three props of it) plus
a single `Row` whose cells carry the read/edit distinction via `Cell type`. That is a deliberate simplification of
the Figma model, not a mismatch.

**Since 2026-09-24 there is a fourth model.** The financial-statement grids on
Figma page 22 use `RowLabelCell` (`type="group-header" | "subtotal" | "total"`)
and `GridValueCell` (`kind="total"`), which carry the hierarchy on the cell
rather than the row. They are deliberately not wired into `Row type="group"`:
that one is still a `bg.subtle` band, while `RowLabelCell type="group-header"`
is the navy `bg.groupHeader` band the live app draws. Pick one model per grid;
never mix them in the same grid. Converging the two is open work.

---

## 10. Modal and panel widths have no sizing token

`Semantic: Sizing` covers icons, controls, avatars, rows and targets — nothing
at the scale of a dialog or a floating panel. `Modal size` (s 400 · m 560 ·
l 800 · xl 1120), the `SelectMenu` minimum width and list height, and the
`ImageCropField` well (160, or 320 × 160 when `wide`) therefore cannot come from
a token.

**Mitigation:** held as named component-local custom properties
(`--modal-width-*`, `--select-menu-*`, `--image-crop-well-*`) declared once on
the component in `src/styles/components.css`, the same way as
`--field-height` (gap 2). They are never repeated.

**Real fix:** add a `Semantic: Sizing/Panel` (or `Dialog`) ramp to the v1.1
tokens file.

---

## 11. Figma properties with no React counterpart — closed in code

**Resolved.** Found on 2026-10-05 by diffing every Figma component's variant
properties against the React props, and closed in the same pass. Kept here so
the mapping is traceable.

| Figma component | Figma property | React |
|---|---|---|
| `Valuation Info` | `Open` = None · Values · Dates · Both | `ValuationInfo` — `open` / `defaultOpen` / `onOpenChange` (`'none' \| 'values' \| 'dates' \| 'both'`) |
| `Header` | `Style = Action Button` | `ColumnHeader kind="action-button"` |
| | `Mark` | `mark` — brand rule across the top edge |
| | `Label` | `label` — tag beside the title |
| | `Tooltip` | `tooltip` — corner indicator plus a hover / focus tooltip |
| | `Icon` | `icon` — trailing 12px glyph |
| | `Input` | `input` — trailing glyph takes the accent tint |
| | `Action` | `action` — accent rule on the top and left edges |
| `cell` | `Label` | `label` |
| | `Tooltip` | `tooltip` |
| | `Icon Type` (Dropdown · Calendar) | `trailingIcon="dropdown" \| "calendar"`, or any glyph |
| `Information Label` | `L1` / `L2` / `L3` | `label`, `value`, `longValue` — each hides when omitted |
| | `Has drop down` | `dropdown` |
| `Selector` | `Drop-Down` | `dropdown` (default true) |
| | `Picker label` | `label` — omit it to hide the label |

**Judgement calls — check these against the design.** Figma records `Input` and
`Action` on `Header` only as booleans with no description, so their rendering
here is read from the variant screenshots, not from a spec: `input` tints the
trailing glyph, `action` draws the accent rule on the top and left edges, and
`mark` / `tooltip` use `Stroke/Focus` for the rule and the corner indicator.
If the designers meant something else, change the CSS in the "Closing the Figma
property gaps" block of `src/styles/components.css`, not the prop names.

Interaction states (Hover, Focus, Pressed) are deliberately not props: they are
CSS pseudo-classes.

---

## 12. Figma documentation was out of date until 2026-10-05

The Figma files lagged behind the library they describe. As of 2026-10-05:

- `TOKEN-CONTRACT.txt` (tokens file, node `538:7`) now lists 511 variables across
  9 collections, including the File and Product identity families, the On Brand
  family, `Chart/Total`, `Background/Unread`, the data-grid tokens, `Heading/XS`
  and the seven new sizing tokens.
- The components `00 · Read Me` index now states 154 component sets and 1,260
  variants, and indexes pages 20–26 (63 sets) and the sets added to pages 09, 11
  and 15.

If either number in Figma disagrees with the code layer again, the live
variables and component sets win — re-extract and regenerate rather than
editing the generated files.

---

## 13. Workflow tone tokens are code-first, pending the Figma library

The Workboard's step colours Blue, Pink, Cyan and Orange have no family in
`Scalar_Design_System-v1.1`. The prototype drew them from `--primitive-*`
steps, which R1 forbids in a component. They are now the semantic family
`--color-workflow-{blue|pink|cyan|orange}-{background|text|stroke|solid|on-solid}`
(`color.workflow.*` in TypeScript), with Light and Dark values.

Unlike every other semantic token, these values were **transcribed into code
first**, from the workboard-v2 file (`mZ0cFiczRr3UCglYIO6Ot0`), local collection
"Workboard: Action Pill (proposed)", Light/Dark. Mapping from that collection:
`{Tone}/Upcoming/Background` → `background`, `/Upcoming/Text` → `text`,
`/Upcoming/Mark` → `stroke`, `/Today/Background` → `solid`, `/Today/Text` →
`on-solid`. Every pair is in the R13 contrast gate (`npm run lint:contrast`):
text on its tint and on-solid on solid at 4.5:1, the stroke at 3:1 on its tint,
the page and the surface — Light and Dark.

**Until the collection is published to the Scalar tokens library**, the values
in `tokens.css` are the reference. When it is published, re-transcribe from the
library and regenerate as for any other token; if a value moves, the library
wins. Do not add a fifth tone here — propose it in Figma first.

---

## 14. Deal tokens: published; the workboard Deal frames still use the old fill

The Workboard Valuation modal fills its Deal card with `Accent/500` (workboard
file `tuFpgEHX8w3BDI40U0FUwV`, node 536:23937). "Accent" there is the Teal
primitive scale in `Scalar_Design_System-v1.1`, but no semantic token pointed at
it, and R1 forbids a component reading `--primitive-teal-500`. The semantic
family `--color-deal-{background|text|subtle|subtle-text|control}`
(`color.deal.*` in TypeScript) now does, in Light and Dark:

| Token | Light | Dark |
|---|---|---|
| `background` | Teal 500 `#08c581` | Teal 800 `#046140` |
| `text` | Teal 900 `#03402a` | Teal 50 `#e9faf4` |
| `subtle` | Teal 200 `#9ce8cd` | Teal 900 `#03402a` |
| `subtle-text` | Teal 800 `#046140` | Teal 200 `#9ce8cd` |
| `control` | Teal 300 `#6bdcb3` | Teal 700 `#058355` |

**The card's ink is Teal 900, not white.** Figma draws the title, company, names
and links white, but white on Teal 500 is 2.25:1, below AA even for large text,
so it cannot pass the R13 gate. Teal 900 (5.3:1) is the colour Figma already uses
for the card's notice and NET / DUE. `npm run lint:contrast` checks `text` on
`background` and `subtle-text` on `subtle` at 4.5:1, and `text` as a glyph on
`control` at 3:1, Light and Dark.

**Status (2026-10-13):** the five variables exist in the tokens file
(`anrnTIJKgu27zV224h7vON`, collection *Semantic: Color*) as `Deal/Background`,
`Deal/Text`, `Deal/Subtle`, `Deal/Subtle Text` and `Deal/Control`
(`VariableID:664:2`–`664:6`), aliasing the Teal steps above, with `WEB` code
syntax `var(--color-deal-…)`. Their resolved values match `tokens.css` exactly.
The library was published the same day, so `Deal/*` is now a library token
like any other: if a value moves in Figma, the library wins — re-transcribe and
regenerate.

**Still open (design):** the workboard file's Deal card frames
(`tuFpgEHX8w3BDI40U0FUwV`, e.g. 536:23937) still draw `Accent/500` with white
text. Switch them to `Deal/Background` + `Deal/Text` (and the stage pill to
`Deal/Subtle` + `Deal/Subtle Text`, the edit button to `Deal/Control`). Until
then code and Figma differ in the card's ink, deliberately: code is AA, the
frames are not.

---

## 15. AI gradient tokens and `AiOutline` were written in code first

Figma has `Gradient/AI` only as a paint style on `AIButton` and `AITool`, with
no variables and no Dark counterpart (gap 5). The "AI is working" outline on
notification cards (Notifications-center file `BbebfOi2JVBIYgQWaSj52G`) needed
its colours as tokens, so the family
`--color-gradient-ai-{violet|blue|teal|pink}` (`color.gradient.ai.*` in
TypeScript) was **transcribed into code first**, Light and Dark:

| Token | Light | Dark | Same value as |
|---|---|---|---|
| `violet` | `#a614ff` | `#c668ff` | `bg.ai` |
| `blue` | `#0268c1` | `#3597ed` | PRISM `Entity/Company` primary |
| `teal` | `#0891b2` | `#22d3ee` | PRISM `Data/Measurement Date` primary |
| `pink` | `#be185d` | `#ea589e` | PRISM `Destination/Page` primary |

They share values with PRISM but are **not** PRISM: PRISM states what an item
is (R11) and must not be borrowed for decoration, so the gradient can move
without touching Global Search. Each stop is drawn as a 2px stroke, so
`npm run lint:contrast` checks it at 3:1 on page and surface, Light and Dark.

`AiOutline` paints them as a conic gradient on the border box and turns the
start angle (`@property --scalar-ai-outline-angle`, 6s linear, infinite), so the
colours follow the outline. Reduced motion stops it. The motion is from
`GOOGLE_AI_STUDIO_GRADIENT_INPUT_ANIMATION.md` (supplied with the
Notifications Center prototype). Its outer glow is not built, because there is no
glow token beyond the elevation ladder (R9).

**Status (2026-10-23):** the four variables exist in the tokens file
(`anrnTIJKgu27zV224h7vON`, *Semantic: Color*) as `Gradient/AI/Violet`, `Blue`,
`Teal` and `Pink` (`VariableID:677:2`–`677:5`). They alias `AI`, `Brand`, `Cyan` and `Pink` 600 in Light
and 400 in Dark, with `WEB` code syntax `var(--color-gradient-ai-…)`, and the library is
published. Their values match `tokens.css` exactly, and they are documented on page *01 · Color*
("v1.1 additions"). If a value moves in Figma, the library wins: re-transcribe and regenerate.
The components file has **AI Outline** (`1753:95`, page *24 · Feedback Patterns*), with its
angular stroke bound to the four variables.

**Still open (design):** `Gradient/AI` the *paint style* on `AIButton` / `AITool` (gap 5) can now
be rebuilt from these variables, which also gives it a Dark mode. The Workflow tones (gap 13) remain
the only family that is code-first and not yet in the library.
