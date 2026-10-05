# Known gaps

These are inherited from the v1.1 library and the component file. Each is
**deliberate and documented** — read the reason before "fixing" one, and if you
do resolve it, fix it in Figma first and re-extract.

---

## 1. Chart series have not passed CVD validation

**Severity: blocks shipping a chart without mitigation.**

In Light mode, `Chart/Series 2` (`#808135`) and `Chart/Series 3` (`#cb0000`)
separate by only **ΔE 4.9 under deuteranopia**, below the ΔE 6 floor. Separately,
`Chart/Series 3` and `Chart/Negative` are the **same hex** in Light (`#cb0000`),
so a categorical series and a semantic "bad" both read as the same red.

**Mitigation, required today:** any chart using three or more series ships a
legend **and** direct labels or texture. `BarChart` does this automatically.
`seriesAccessibilityWarning()` in `src/components/charts/series.ts` is the
programmatic guard for charts you build yourself.

Stacked bars are a deliberate exception: a per-segment label sits on top of the
segment above it, putting dark text on a dark fill, and the system has no
per-series on-colour token to switch to. They label the column total instead and
carry identity by stack order — a non-colour channel, stable across categories.
A `Chart/Series N/On` ramp would remove the exception.

**Real fix:** re-step the `Chart/Series` ramp in the v1.1 tokens file. Still
outstanding as of 2026-09-21.

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

## 6. Figma counts drift slightly from the published contract text

The `TOKEN-CONTRACT.txt` frame in the tokens file states 461 variables across 9
collections. The live library, read directly, has slightly more:

| Collection | Contract text | Live |
|---|---|---|
| `Semantic: Color` | 144 | **145** (`Chart/Total` was added) |
| `Semantic: Radius` | 7 | **8** (`2XS` at 2px was added) |
| `Semantic: Sizing` | 15 | **17** (`Row/Compact`, `Target/Dense`) |

**This package is generated from the live library**, so it carries the newer
values. The contract text is stale, not wrong in kind. Notably, `Chart/Total`
now exists, which resolves the contract's own "there is no neutral chart token"
gap — `WaterfallChart` uses it for total bars.

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

Re-checked 2026-10-05: both are **still unpublished**.

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
merges `Row-reading` and `Row-input` into a single `Row` whose cells carry the
read/edit distinction via `Cell type`. That is a deliberate simplification of
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
