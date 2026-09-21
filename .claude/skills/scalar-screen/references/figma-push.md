# Pushing a screen back into Figma

Run this **after** the React screen renders correctly in both themes. The point
is to give design a frame they can react to and edit, not a picture.

## Before you start

- Load the `figma-generate-design` and `figma-use` skills. `use_figma` without
  `figma-use` fails in hard-to-debug ways.
- Confirm the target: which Figma file, which page, and whether it is shared.
  **Ask before writing to a shared file**, and name the file and page you are
  writing to.

## The one rule that matters

**Assemble from instances of the published v1.1 library components. Never
redraw the UI as rectangles and text.**

A redrawn screen looks right in a screenshot and is worthless afterwards: it
does not respond to a token change, it cannot be restyled from the library, and
design cannot swap a variant. That is the difference between a screen and a
picture of a screen.

| Figma file | Key | Holds |
|---|---|---|
| Components | `Z4MtKOfkNEzhMYJzN1q3kR` | the 88 component sets |
| Tokens | `anrnTIJKgu27zV224h7vON` | variables + 3 elevation styles |

Both are published, so `importComponentByKeyAsync` and
`importVariableByKeyAsync` work from any file.

## Sequence

1. **Discover.** `search_design_system` scoped with `includeLibraryKeys` to the
   Scalar libraries — unscoped it returns unrelated community kits. Or read the
   component sets straight off the components file.
2. **Import** the component keys you need, once, and keep the ids.
3. **Build the skeleton**: page frame, then a `placeholder = true` section per
   region of the screen. Return the node ids.
4. **Fill one region per call.** Instance the component, set its variant
   properties to match the React props, then `placeholder = false`.
5. **Bind variables, do not paste values.** Padding and gap bind to
   `Semantic: Spacing`, fills to `Semantic: Color`, radius to `Semantic: Radius`,
   type to `Semantic: Type`. A hard-coded hex in Figma is the same bug as a hard
   -coded hex in CSS.
6. **Set the type mode on the frame** — Desktop (1440), Desktop Large (1920) or
   Mobile (393). Never hand-resize type to fit.
7. **Screenshot and compare** against the rendered React screen. Fix drift
   before handing over.

## Mapping props to variants

The React API and the Figma variant matrix are the same model, collapsed
differently. `docs/components.md` has the full table; the ones that trip people:

| React | Figma |
|---|---|
| `<Button variant tone size>` | Button `Style` × `Type` × `Size` |
| `disabled` | Button `Type=Disabled` (a Type, not a State) |
| `:hover` / `:active` | Button `State=Hover` / `Pressed` — CSS in code, variants in Figma |
| `<Row>` + `<Cell type>` | `Row-reading` vs `Row-input` |
| `<SectionSubMenu>` | `Captable sub-menu` / `Valuations sub-menu` |
| `<ToolSwitch value>` | `Valuation` + `Workboard` + `Tool-switch` |
| `chartScaffold(grid)` | `Chart Frame` `Grid` variant |

Interaction states have no CSS equivalent in Figma, so a handed-over screen
shows the default state. Only build a hover or pressed frame if design asked
for one.

## What not to push

- Charts. They are Chart.js on a canvas; Figma has no equivalent and a redrawn
  chart is a picture. Push the surrounding screen and leave a frame sized for
  the chart with a note naming the component and its props.
- Anything still failing `npm run verify`. Fix the code first — pushing a broken
  screen puts the drift into design's hands.
