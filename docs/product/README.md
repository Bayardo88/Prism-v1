# Scalar product: pages and how they fit together

This is the product documentation for the **Scalar-full-product** Figma file
([`cZktZhD0ssL5lRVOvSqmOV`](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product)).
All 103 frames in that file are coded as a clickable React prototype in
[`apps/product/`](../../apps/product). The prototype is built only from
`@scalar/design-system`.

| Read | For |
|---|---|
| This file | The platform: its areas, its chrome, how you move between pages, and the rules that apply everywhere |
| [`pages/`](pages) | One document per Figma page. Each screen gets its purpose, how you get there, its states, the components it uses, and its behaviour rules |
| [`screen-catalog.md`](screen-catalog.md) | Generated. Every Figma frame with its route, state, component and Figma link |
| [`screens.json`](screens.json) | Generated. The same catalog in machine-readable form, read by the `scalar-product` skill |

## Run it

```bash
npm install
npm run product          # builds the package + app, serves on :4178
```

Open <http://localhost:4178/apps/product/index.html#/catalog>. Any Figma node id
also works as a URL: `#/figma/11-20696` opens the Income Statement exactly as
that frame draws it.

---

## 1 · Information architecture

The product has three scopes. Each scope has its own chrome.

```
Firm scope (Primary Menu)                     Company scope (company header)
├─ Home  /                                    /companies/:companyId/…
│   └─ Portfolio Home  /portfolio              ├─ Summary ─── Summary Holdings · Company Overview · Daily NAV Settings
├─ Intelligence                               ├─ Financials ─ Income Statement · Balance Sheet · KPIs
│   ├─ Summaries                              ├─ Cap Table ── Securities · Fund Ownership · Breakpoints · Cash Flow Ledger
│   ├─ Schedule of Investments                ├─ Valuations ─ Summary · Conclusions · Backsolve
│   └─ Daily NAV                              ├─ Waterfall  (current + saved views)
├─ Valuations   (firm portfolio grid)         └─ Documents ── Document List · Questions  (+ Information Request task)
├─ Waterfalls   (firm scenario sheet)
└─ Documents    (all documents + viewer)      Admin & settings scope (User Menu)
                                              ├─ Account ─── Settings · Two-Factor Authentication
                                              ├─ User Management
                                              ├─ Comp Groups
                                              ├─ Audit Logs
                                              └─ Firm Settings ─ Profile · SSO · SCIM · Daily NAV Settings ·
                                                                 Daily NAV Companies · Scalar AI · Settings
```

Every route is defined in [`apps/product/src/routes.ts`](../../apps/product/src/routes.ts).
The IA can only change there.

| Figma page | Area | Route(s) | Doc |
|---|---|---|---|
| 01 · Home & Global Navigation | Home, global menus | `/`, `/portfolio` | [01-home](pages/01-home.md) |
| 02 · Intelligence | Portfolio analytics | `/intelligence/*` | [02-intelligence](pages/02-intelligence.md) |
| 03 · Valuations (Firm) | Portfolio valuation grid | `/valuations` | [03-valuations](pages/03-valuations.md) |
| 04 · Waterfalls (Firm) | Scenario waterfalls | `/waterfalls` | [04-waterfalls](pages/04-waterfalls.md) |
| 05 · Documents (Firm) | Firm document library | `/documents` | [05-documents](pages/05-documents.md) |
| 06 · Company · Summary & Financials | Holdings, P&L, balance sheet, KPIs | `/companies/:id/summary`, `/financials/*` | [06-company-summary-financials](pages/06-company-summary-financials.md) |
| 07 · Company · Cap Table | Securities, ownership, breakpoints, ledger | `/companies/:id/cap-table/*` | [07-company-cap-table](pages/07-company-cap-table.md) |
| 08 · Company · Valuations | Valuation summary, conclusions, backsolve | `/companies/:id/valuations/*` | [08-company-valuations](pages/08-company-valuations.md) |
| 09 · Company · Waterfall | Company waterfall views | `/companies/:id/waterfall` | [09-company-waterfall](pages/09-company-waterfall.md) |
| 10 · Company · Documents & Requests | Documents, info requests, questions | `/companies/:id/documents/*` | [10-company-documents](pages/10-company-documents.md) |
| 11 · Company · Overview & Settings | Company profile, Daily NAV config | `/companies/:id/overview`, `/daily-nav-settings` | [11-company-overview-settings](pages/11-company-overview-settings.md) |
| 12 · Account Settings | The signed-in user | `/account/*` | [12-account](pages/12-account.md) |
| 13 · User Management | Firm users and roles | `/admin/users` | [13-user-management](pages/13-user-management.md) |
| 14 · Comp Groups | Public and transaction comps | `/admin/comp-groups` | [14-comp-groups](pages/14-comp-groups.md) |
| 15 · Audit Logs | Activity log | `/admin/audit-logs` | [15-audit-logs](pages/15-audit-logs.md) |
| 16 · Firm Settings | Firm-wide configuration | `/firm-settings/*` | [16-firm-settings](pages/16-firm-settings.md) |

## 2 · The chrome: one per scope, never redrawn

| Component (`apps/product/src/shell/`) | Used by | What it holds |
|---|---|---|
| `AppFrame` | every page | The navy Primary Menu: product areas, Companies picker, portfolio Date, Global Search (⌘K), Notifications, the Valuations/Workboard switch, User Menu. The body sits below it. |
| `CompanyLayout` | pages 06–11 | The company header (name + Secondary Menu of company sections + right-hand selectors + ⋮ company actions), the Tertiary sub-nav with page actions, a footer action bar and the Workspace dock |
| `PageHeader` | firm areas, settings, admin | Page title, section tabs, page actions (Save) |
| `WorkspaceDock` | company pages, waterfalls | The Notes / Sheets / Documents dock. A tab opens the Workspace Drawer. |
| `overlays/` | global | Companies menu, Date menu, Global Search, Notification Center (inbox and settings), User Menu |

The global menus are **platform features, not page features**. They open by
click on every screen. A frame that draws one open (for example "Home — Global
Search open") only sets `openMenu`.

## 3 · Moving across the platform

| From | Action | To |
|---|---|---|
| Anywhere | Primary Menu → Intelligence / Valuations / Waterfalls / Documents | The firm-level area |
| Anywhere | Companies picker → a company | That company's Summary |
| Anywhere | Companies picker → Add New Company | Portfolio Home with the Add Company modal |
| Anywhere | Global Search → a result | The page, company, document or version that the result's PRISM type names |
| Anywhere | Avatar → User Menu | Account, User Management, Comp Groups, Audit Logs, Firm Settings (expands in place), Switch firm |
| Home | Product Tile | Intelligence, Valuations, Waterfalls or Documents |
| Home | Directory entry | That company's Summary |
| Intelligence · Summaries | Company name | Company Summary |
| Intelligence · Schedule of Investments | Company name | Company Cap Table |
| Intelligence · Daily NAV | Company name | Company Daily NAV Settings |
| Valuations (firm) | Company name | Company Valuation Summary |
| Waterfalls (firm) | Company picker → "Go to <company>" | That company's Waterfall |
| Company header | Secondary Menu | Summary, Financials, Cap Table, Valuations, Waterfall, Documents |
| Company header | ⋮ company actions | Company Overview (Edit Company), Daily NAV Settings |
| Company Documents | New Info Request | Information Request (a full-page task that returns to Documents) |

## 4 · Rules that apply on every page

- **Colour means provenance in grids.** Blue values (`Cell type="input"`) are
  entered by a user and can be edited. Green values (`type="data"`) are sourced
  or calculated and are read-only. Black is plain readable data. Totals sit in a
  `Row type="total"` band. A cell's colour is never decoration.
- **Column headers are one line.** A wide table scrolls horizontally inside
  the page. The header never wraps.
- **Menus, modals and popovers are states, not pages.** They keep the URL of
  the page under them and add `?state=`. Anything that changes the working
  context, such as a company or a task, changes the route.
- **Unsaved work is guarded.** Leaving a dirty Backsolve asks for confirmation
  with a `ConfirmationDialog` whose confirm button repeats the verb.
  Validation errors appear in a banner and on the field that caused them.
- **Three navigation tiers at most.** The tiers are Primary Menu, company
  Secondary Menu and Tertiary sub-nav. A fourth level goes in the page body.
- **PRISM colour says what a thing is.** A company, a document or a version
  each has its own colour. PRISM never signals access or permission.
- Everything else is the design-system contract in
  [`AI-GUIDE.md`](../../AI-GUIDE.md): tokens only, a 12px text floor, visible
  focus, and dark mode that works.

## 5 · Known limits of the prototype

- The data is fixtures (`apps/product/src/data/fixtures.ts` plus each area's
  `data.ts`). Saves live only in local state.
- The real product icon set (SDS_Main icons) is not in the package, so
  structural glyphs stand in. See [`docs/known-gaps.md`](../known-gaps.md).
- Companies that appear in a frame but not in the fixtures are shown either as
  plain names or linking to ABC Co.
- The page docs record the design-system gaps each builder hit, under "Gaps &
  open questions". Those lists are the backlog for new components.

## 6 · Changing a page

Use the **`scalar-product`** skill (`.claude/skills/scalar-product/`). It
covers creating a page, editing one and prototyping a flow, and it keeps the
catalog and the Figma coverage check green. The check itself:

```bash
npm run verify:product   # compile app · token lint · all Figma frames coded exactly once
```
