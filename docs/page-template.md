# Page template — the starting point for every screen

**Every new screen in the product starts from `PageTemplate`.** It is the Figma
frame **"Page Template · body space used for any component"**
([components file `Z4MtKOfkNEzhMYJzN1q3kR`, node `1671:13280`](https://www.figma.com/design/Z4MtKOfkNEzhMYJzN1q3kR/Scalar_Design_System-Components?node-id=1671-13280))
coded in React. It owns the navigation, the page body and the drawer; you supply
the content.

This page is written for developers and for AI coding agents. Agents: read
[§6](#6-rules-for-ai-agents) before writing any screen.

---

## 1. Anatomy

```
┌ navigation ──────────────────────────────────────────────┐ Primary Menu          48
│ companyInfo                                              │ Company info + Secondary Menu   32
│ ┌ sheet ───────────────────────────────────────────────┐ │
│ │ subNavigation                                        │ │ Tertiary Menu         40
│ │ ┌ BODY-SLOT ───────────────────────────────────────┐ │ │
│ │ │  children                                        │ │ │ fills the rest, scrolls on its own
│ │ └──────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────┘ │
│ drawer                                                   │ Workspace Drawer, docked
└──────────────────────────────────────────────────────────┘
```

| Slot | Prop | Pass | Figma layer |
|---|---|---|---|
| 1 · Navigation | `navigation` | `PrimaryMenu` | Primary Navigation |
| 2 · Company header | `companyInfo` | `CompanyInfo` (with a `SecondaryMenu` as its children) | Company Information |
| 3 · Sub-navigation | `subNavigation` | `TertiaryMenu` | Secondary Navigation (the Tertiary Menu component) |
| 4 · **Body** | `children` | **anything** | **BODY-SLOT** |
| 5 · Drawer | `drawer` | `WorkspaceDrawer` (use `docked` for the resting strip) | Workspace Tabs |

Every slot is optional and independent. Leave one out and it simply is not
drawn; the body takes whatever height is left.

Measured in the browser at 1440 × 900, the template matches the Figma frame:
navigation 48 px at y 0, company header 32 px, sub-navigation 40 px, and the body
slot starting at y 120 with a 16 px inset on both sides and a 1408 px width.

## 2. The body slot

`children` **is** the BODY-SLOT. Put any component or composition in it.

- **Omit `children`** and the template shows the **`BodySlot` placeholder** — a
  dashed box labelled `BODY-SLOT` / "Replace this with the page content". That is
  the starting state of a new screen.
- **Pass `children`** and the placeholder disappears. A shipped screen never
  contains `BodySlot`.
- The slot fills the remaining height and **scrolls on its own**, so the
  navigation above it and the drawer below it stay in place. Do not add a second
  scroll container just to make it scroll.
- The slot is inset 16 px (`space.l`) on both sides. Do not add your own outer
  page padding or margin; do not add a `max-width` to centre it.

## 3. Using it in the product app

For product screens use the **product wrapper**, which wires the standard chrome
(Primary Menu with its global menus, company header, Secondary Menu, Workspace
dock) into the template:

```tsx
// apps/product/src/screens/<page>/MyScreen.tsx
import { PageTemplate } from '../../shell/PageTemplate.js';

export function MyScreen({ params }: ScreenProps) {
  const company = companyById(params.companyId);
  return (
    <PageTemplate area="valuations" company={company} section="valuations">
      <MyContent />                       {/* ← the BODY-SLOT */}
    </PageTemplate>
  );
}
```

| Prop | Meaning |
|---|---|
| `area` | Which Primary Menu item is current: `home` · `intelligence` · `valuations` · `waterfalls` · `documents` · `reports` · `company` · `settings` |
| `company`, `section` | Show the company header and Secondary Menu; `section` is the current item. Omit both for firm-level screens |
| `headerEnd` | Right side of the company header (selectors, the ⋮ menu) |
| `subNav`, `subNavEnd`, `subNavAdd` | Tertiary Menu items, its right-hand tools, and the `+` handler. Omit all to drop the bar |
| `dock`, `dockOpen`, `dockContent`, `dockPanels` | The Workspace drawer. `dock={false}` leaves it off |
| `openMenu`, `overlay`, `date` | Pass-through to `AppFrame` (global menus, a screen-level modal, the Measurement Date) |
| `children` | The body slot. Omit for the placeholder |

`CompanyLayout` still works and existing screens keep using it. **New screens use
`PageTemplate`.** Migrating an old screen is a swap of the wrapper and its prop
names; it is not required.

## 4. Using it outside the product app

Anywhere else, use the design-system component directly and pass the slots
yourself. [`examples/screens/PageTemplate.tsx`](../examples/screens/PageTemplate.tsx)
is a complete, working composition — copy it. Run it with `npm run build &&
npm run build:examples`, serve the repo and open `examples/page-template.html`
(`#content` shows a grid in the slot).

```tsx
import { PageTemplate, PrimaryMenu, CompanyInfo, SecondaryMenu, TertiaryMenu, WorkspaceDrawer } from '@scalar/design-system';

<PageTemplate
  navigation={<PrimaryMenu …>…</PrimaryMenu>}
  companyInfo={<CompanyInfo name="Apple Inc."><SecondaryMenu>…</SecondaryMenu></CompanyInfo>}
  subNavigation={<TertiaryMenu …>…</TertiaryMenu>}
  drawer={<WorkspaceDrawer docked tabs={…} />}
>
  <YourContent />
</PageTemplate>
```

`fullHeight` (default `true`) makes the template at least one viewport tall. Set
it to `false` only when something else already owns the page height — the product
wrapper does, because `AppFrame` renders its own full-height column.

## 5. Recipes

**A data sheet (grid in the body).** The most common screen.

```tsx
<PageTemplate area="company" company={company} section="cap-table" subNav={<>…</>} subNavEnd={<ToolbarSave />}>
  <DataGrid label="Securities" head={<>…</>}>{rows}</DataGrid>
</PageTemplate>
```

**A firm-level page (no company).** Leave `company` out.

```tsx
<PageTemplate area="documents"><DocumentList /></PageTemplate>
```

**A page with no drawer.**

```tsx
<PageTemplate area="settings" dock={false}>…</PageTemplate>
```

**A form or settings page.** The body slot is just a column; compose `FormField`s
and `Card`s inside it with `space.*` gaps. Do not re-create the navigation.

**An empty / loading / error body.** Put `EmptyState`, `Skeleton` or `Alert` in
the slot — the chrome around it does not change.

## 6. Rules for AI agents

Follow these in order. They exist because the template is the one place where a
wrong shortcut gets copied into every page.

1. **Start from `PageTemplate`.** Never begin a screen by assembling
   `PrimaryMenu`, `CompanyInfo` and `WorkspaceDrawer` by hand. In `apps/product`
   import `PageTemplate` from `shell/PageTemplate.js`; elsewhere from
   `@scalar/design-system`.
2. **Put the screen in `children`.** That is the body slot. Do not edit the
   template, its CSS or the product wrapper to fit one screen.
3. **Do not add chrome to the body.** No second navigation bar, no page header
   repeating the company name, no outer padding, no `max-width`, no scroll
   wrapper around your content.
4. **Do not remove or reorder the slots.** To hide one, omit its prop.
5. **Leave the placeholder only while scaffolding.** A finished screen has real
   `children`; if you are handing over a skeleton, say so.
6. **Choose slots from the ticket, not from habit.** Company page → pass
   `company` and `section`. Firm page → omit them. Needs sub-navigation → pass
   `subNav`. Needs the drawer → leave `dock` on; otherwise `dock={false}`.
7. **Everything in the body obeys the contract in [AI-GUIDE.md](../AI-GUIDE.md):**
   semantic tokens only, `space` for gaps and `size` for widths, the 12 px text
   floor, components before custom markup. `npm run verify` must pass.
8. **If the template cannot express what the ticket needs** (a second drawer, a
   side panel, a full-bleed hero) — stop and say so. Propose a new slot; do not
   work around it inside the body.
9. **Never register the template itself as a product screen.** The product
   catalog only accepts frames from the Scalar-full-product Figma file.

### Checklist before you hand off

- [ ] The screen is `<PageTemplate …>{content}</PageTemplate>` — no hand-assembled chrome
- [ ] No `BodySlot` placeholder left in a finished screen
- [ ] `area`, `company` / `section`, `subNav` and `dock` match the ticket
- [ ] No outer padding, margin, `max-width` or extra scroll container in the body
- [ ] `npm run verify` passes (and `npm run build:product` for product screens)
- [ ] Looked at it in a browser at 1440 px wide

## 7. In Figma

Everything is on the **18 · Template** page of the components file:

- **Page Template · body space used for any component** (`1671:13280`) — the
  designers' frame, left exactly as drawn. Its grey `BODY-SLOT` rectangle is the
  body.
- **Page Template · Body Slot** — a component copy of that frame in which
  `BODY-SLOT` is a **real Figma slot** (component property `BODY-SLOT`, stretches
  to fill, placeholder content inside). Place an instance and drop any component
  into the slot from the instance panel. Everything outside the slot is an
  instance.
- **Page Template · Body Slot · Documentation** — the same rules as this page, in
  Figma.

| Code | Figma |
|---|---|
| `PageTemplate` | Page Template · body space used for any component (`1671:13280`) |
| `BodySlot` | `BODY-SLOT` |
| `navigation` | Primary Navigation → `Primary Menu` |
| `companyInfo` | Company Information → `Company info` |
| `subNavigation` | Sheet → Secondary Navigation → `Tertiary Menu` |
| `drawer` | Workspace Tabs → `Workspace Drawer` (docked) |

## 8. Known differences from the frame

- The docked drawer strip is **37 px** in code and **28 px** in the frame: the
  strip reuses `WorkspaceDrawerTab`, whose padding is larger than the frame's
  hand-set tab. Resolve it in the tab component, not in the template.
- The frame's body is a flat `#d9d9d9` rectangle. The placeholder uses
  `Background/Subtle` and a dashed `Stroke/Control` edge instead, because a raw
  grey has no token.
