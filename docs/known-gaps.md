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

## 4. The icon library is not in this package

Product glyphs live in a third Figma library, `SDS_Main icons`, which is
editable from neither of the two files this package was generated from.

**What this means for you:** export the glyph you need and pass it as children
to `Icon`. The handful of glyphs in `src/components/icon/glyphs.tsx` are
**structural only** — chevrons, a tick, a close — and exist so this package's own
components (Select, Checkbox, Pagination) function. They are not the Scalar icon
set and should not be used in product UI.

Related: 135 glyph fills in `SDS_Main icons` resolve to `Primitive: Color`, and
icons imported from it default to `Text/On Brand` (white), which is invisible on
a light surface. The `Icon` component always sets a tint, so anything rendered
through it is safe.

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
