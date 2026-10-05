---
name: scalar-product
description: Create a new page, edit an existing page, or build a clickable prototype of the Scalar product, using the coded screens, platform chrome and components in Prism-v1's apps/product (the React version of the Scalar-full-product Figma file). Use whenever someone asks to add, change, extend, mock up or prototype any Scalar screen, flow, modal or state — Home, Intelligence, Valuations, Waterfalls, Documents, any Company page (Summary, Financials, Cap Table, Valuations, Waterfall, Documents), Account, User Management, Comp Groups, Audit Logs or Firm Settings — or pastes a Scalar-full-product Figma link.
---

# Scalar Product — pages & prototypes

The whole Scalar product is coded in **`apps/product/`** of the Prism-v1 repo
(`github.com/Bayardo88/Prism-v1`). Every one of the 103 frames in the
**Scalar-full-product** Figma file (`cZktZhD0ssL5lRVOvSqmOV`) is a *state* of a
*screen* there, reachable at its own URL. You work by **reusing** those
screens, the platform chrome and the design-system components — never by
drawing a page from scratch.

Three layers, and which one you touch:

| Layer | Where | You… |
|---|---|---|
| Tokens + components | `src/` (`@scalar/design-system`) | **use** them. Never add one from this skill — propose it instead. |
| Platform chrome | `apps/product/src/shell/` | **use** it (`AppFrame`, `CompanyLayout`, `PageHeader`, `WorkspaceDock`, global overlays). |
| Screens | `apps/product/src/screens/<page>/` | **create and edit** here. |

---

## Step 0 — Locate the repo and load the contract

1. Find the repo: `~/Documents/GitHub/Prism-v1`, or the current directory if it
   has `apps/product/`. If neither exists: `git clone https://github.com/Bayardo88/Prism-v1`.
2. Read **`AI-GUIDE.md`** (the design-system contract — R1–R13, component API).
   It overrides anything a screenshot or an existing screen seems to show.
3. Read **[references/app-architecture.md](references/app-architecture.md)** — how
   screens, states, routes, chrome and overlays fit together.
4. Open **`docs/product/screen-catalog.md`** (or `docs/product/screens.json`) to
   see what already exists. Read `docs/product/README.md` for the navigation map.
5. Read **[references/reuse-ladder.md](references/reuse-ladder.md)** (the gate) and
   **[references/screen-logic.md](references/screen-logic.md)** (screen brief,
   archetypes, Figma grounding). Both apply to every mode below.
6. `npm install` if `node_modules/` is missing.

## Step 1 — Classify the request

| The user wants… | Mode | Go to |
|---|---|---|
| A page that doesn't exist yet | **New page** | Step 2A |
| A change to a page that exists (layout, content, a new state, a new modal) | **Edit page** | Step 2B |
| A flow to click through / test an idea, possibly throwaway | **Prototype** | Step 2C |

A Figma link to `cZktZhD0ssL5lRVOvSqmOV` → look its node id up in
`docs/product/screens.json` (`states[].figmaNode`). Found = **Edit page** on that
screen/state. Not found = the frame is newer than the code: **New page** (or a new
state on the closest screen), and add the frame to `apps/product/figma-frames.json`.

Say which mode and which existing screen(s) you will start from, in one line,
before writing code.

## Step 1b — Reuse check, then screen brief (mandatory, before any JSX)

1. Run `node .claude/skills/scalar-product/scripts/reuse-check.mjs <2–4 keywords + synonyms>`.
   It searches screens/states, the Figma→React component map, the AI-GUIDE
   intent table, page docs, tokens and known gaps in one go.
2. Write the **screen brief** from `references/screen-logic.md` §1 (job, chrome,
   archetype, route + entry point, data, inputs vs calculated, states, actions,
   rules, reuse verdict). This is the logic the code implements — it comes from
   the design system's documented patterns and the page docs, not from taste.
3. Walk the **reuse ladder**. Everything on the page must land on rungs 1–5.
   A new component, token or layout is allowed **only when the feature itself
   needs behaviour no existing piece provides** — then follow the rung-7
   protocol (state the gap, ask, build smallest, log it). Never for looks.

## Step 2A — New page

0. **Build it in `PageTemplate`** (`apps/product/src/shell/PageTemplate.tsx`): your
   content is its `children` (the body slot). Never assemble the Primary Menu,
   company header or drawer by hand, and add no outer padding or scroll wrapper
   in the body. Read `docs/page-template.md` §6 first.
1. **Pick the nearest existing screen as the base** from the catalog — same
   archetype (grid / form / settings / detail / list), same chrome (firm,
   company or settings). Copy its structure, not its data.
2. **Choose the home for it**: the `screens/<page>/` folder of the Figma page it
   belongs to, or a new folder `screens/p17-<area>/` (then add it to
   `registry.ts` and give it a Figma page name).
3. **Add the route** in `apps/product/src/routes.ts` (company pages go under
   `company:` and use `companyPattern(...)` in the ScreenDef).
4. **Wire the way in and out.** A page nobody can reach is not done: add the
   Secondary/Tertiary menu item, tab, row link, or menu entry that leads to it
   (chrome lives in `shell/` — editing it is fine when the IA really changes; say so).
5. Register a `ScreenDef` with at least one state. Every real state needs a
   Figma frame id: get it from design, or push the page to Figma (Step 4) and
   add the new frame to `apps/product/figma-frames.json`. Until then it is a
   prototype (Step 2C).

## Step 2B — Edit page

1. Find the screen: catalog → `component` + `id` → `screens/<page>/<Component>.tsx`.
2. Read the whole screen file and its `index.ts` entry before changing anything.
3. A new visual variant of an existing page is a **new state**, not a new screen:
   add `{ key, label, figmaNode, section }` and derive the UI from `state`,
   keeping the trigger interactive (`useState(initialFromState)`).
4. Keep shared names and figures in `data/fixtures.ts` in sync: "ABC Co" must
   be the same company everywhere.
5. Don't break other states — open each state of the screen after the change.

## Step 2C — Prototype

1. Prototype in **`apps/product/src/screens/prototypes/<name>/`** with its own
   `index.ts` exporting `screens`, registered in `registry.ts` after the real
   pages. Routes start with `/prototypes/<name>/…` so they can't collide.
2. **Compose from real screens**: import existing screen components or their
   inner pieces, the shell, and fixtures. A prototype that re-draws the Cap
   Table instead of importing it will drift on day one.
3. Make the flow clickable end to end with `href(...)`/`navigate(...)`; model
   each step as a state if it's one screen, or as screens if the URL changes.
4. Mark it clearly: `figmaPage: 'Prototype · <name>'`, and give each state a
   `figmaNode` of `proto:<name>:<n>` — the coverage check accepts that prefix
   and lists prototypes in their own catalog section. When a prototype is
   accepted, promote it (Step 2A) and replace the ids with real Figma frames.

## Step 3 — Verify. Don't claim it works until you've looked.

```bash
npm run build            # only if src/ changed
npm run verify:product   # compile app + token lint + every-frame coverage check
```

Also confirm the reuse contract: `git diff --stat` shows **no new file under
`src/components/` or `src/styles/`** unless a rung-7 request was approved, and
no `style={{…}}` value that isn't a token. Then render: `node scripts/serve.mjs` → `http://localhost:4178/apps/product/index.html#<route>?state=<key>`.
Check, in order: no console errors · every state of the screen you touched ·
the links in and out actually navigate · light mode only — emulate OS dark and confirm the page stays light (R14) ·
focus visible · nothing under 12px. Report what you checked; if you could not
render, say so.

## Step 4 — Docs and Figma

- Update `docs/product/pages/<page>.md` (purpose, how users get here, states,
  components, rules). `npm run product:catalog` regenerates the catalog.
- To push the page back to Figma, follow
  `.claude/skills/scalar-screen/references/figma-push.md` (import published
  library components, assemble instances — never redraw as rectangles). Ask
  before writing to a shared Figma file and name the file and page. The Figma
  MCP seat has a call cap: estimate calls first and batch.

---

## Refuse to

- Hand-roll a component, colour, spacing or type size that the layer has
  (raw hex/px fails `lint:tokens` anyway), or add a component/layout/token
  because it "looks better" — only because the feature demands it, via
  `references/reuse-ladder.md` rung 7.
- Invent behaviour: if the page docs or DS patterns already define how a thing
  works (validation, empty state, confirmation, pagination), follow them.
- Build a page without the platform chrome, or with chrome copied instead of
  `AppFrame`/`CompanyLayout`.
- Leave a new page unreachable, or break an existing route (the catalog check
  will catch a dropped Figma frame; it can't catch a dead link — you must).
- Colour a Global Search result by anything but its PRISM type, or use PRISM
  for access/permission.
