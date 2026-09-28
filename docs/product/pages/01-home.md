# 01 · Home & Global Navigation

The firm's landing page and the platform-wide chrome that sits on every screen. Analysts, firm admins and auditors land here after sign-in to switch firms, jump into one of the four products, or find a portfolio company in the A–Z directory. The Primary Menu's global overlays — Companies, Date, Global Search and Notifications — are drawn on this page and are live on every screen of the prototype.

## Screens

### Home — `/`
Firm Switcher strip, four Product Tiles, a company search and the A–Z portfolio directory. Users arrive from sign-in or the Scalar logo in the Primary Menu. Product Tiles go to Intelligence (Summaries), Valuations, Waterfalls and Documents; every directory entry opens that company's Summary.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Home — Firm Portfolio](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=7-18) | 7:18 | `#/` |
| companies-menu | [Home — Companies dropdown open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-12608) | 11:12608 | `#/?state=companies-menu` |
| date-menu | [Home — Date dropdown open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-16075) | 11:16075 | `#/?state=date-menu` |
| search | [Home — Global Search open](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-20210) | 11:20210 | `#/?state=search` |
| notifications | [Home — Notifications popover](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-23112) | 11:23112 | `#/?state=notifications` |
| notification-settings | [Home — Notification settings](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=14-10216) | 14:10216 | `#/?state=notification-settings` |

Components used: AppFrame (PrimaryMenu, MainMenuItem, CompanyDropdown, Selector, SearchBar, Notification, ToolSwitch, Avatar), FirmSwitcherTile, ProductTile, Input, Icon, Heading, Text, DirectoryGroup, EmptyState, ComboboxPanel, ShowMoreRow, Button, GlobalSearch, SearchResultRow, SearchScopeChip, KeyHint, Link, NotificationCenter, SettingRow, Switch, Checkbox, Overline, FloatingLabelSelect, Select.

Behaviour & rules:
- Firm Switcher: one tile is always selected (the current firm, Spatical Ventures). Clicking another tile selects it locally; the prototype does not re-scope data.
- Company search filters the directory as you type; no match shows `EmptyState type="no-results"` with the way out (clear the search).
- The directory is the fixture companies plus the extra names drawn in Figma (Empty Company, Etrade, Euros Financials, Fund Owns Preferred Notes, Future 4 Liq Pref, Future Exit Liq Pref, GPC), grouped by first letter.
- **Companies menu** (`shell/overlays/CompaniesMenu.tsx`): searchable ComboboxPanel, first 10 companies, "Show N more companies" reveals the rest, "Add New Company" goes to Portfolio Home → Add Company modal. Selecting a company opens `/companies/:id/summary`.
- **Date menu** (`DateMenu.tsx`): searchable list of measurement dates (newest first, "Most Recent" selected), "Show N more measurement dates", "Add Measurement Date". Selecting closes the menu; the value in force is owned by AppFrame.
- **Global Search** (`SearchOverlay.tsx`): opens on focus of the Primary Menu search bar. Scope stack starts at the firm (Spatical Ventures). Empty query shows the Quick Access set from Figma (Intelligence, Valuations, Summary, Financials, two Q2 2026 measurement dates). Typing searches pages, companies, documents, versions, measurement dates, firm actions and company actions, each PRISM-typed by what it is. Tab on a company pushes it onto the scope (company pages then target that company); Backspace pops; Enter/click navigates; Esc closes. Max three scope chips.
- **Notifications** (`NotificationsMenu.tsx`): Notification Center popover. Desktop / Global delivery switches apply at once. The gear toggles the settings view: per-type switches (Processing Jobs … Workboard) and a company scope — "All companies (all firms)" ticked disables the Firm and Companies pickers. Empty inbox shows "No notifications — You're all caught up."
- Popovers close on outside click and Escape.

### Portfolio Home — `/portfolio`
The same landing page, used as the entry for adding a company. Reached from the Companies menu → "Add New Company" (from any screen) or Global Search → "Add New Company".

| State | Figma frame | Node | Open with |
|---|---|---|---|
| companies-add | [Portfolio Home — Companies dropdown (Add New Company)](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-14684) | 16:14684 | `#/portfolio?state=companies-add` |
| add-company | [Portfolio Home — Add Company modal](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-14723) | 16:14723 | `#/portfolio?state=add-company` |

Components used: as Home, plus Modal, FloatingLabelInput, FloatingLabelSelect, Checkbox, Button.

Behaviour & rules:
- Add Company fields: Name \* and FY End \* (defaults 12/31) are required; Save stays disabled until both have a value. Legal Company Name, Website optional. Captable and Financials Currency default to USD; IRR Currency is optional and "Defaults to USD". "Enable Daily NAV for this company" is ticked by default.
- The modal does not close on scrim click (unsaved input); Cancel, Esc or the close button dismiss it. Save closes it (no persistence in the prototype).

## Cross-platform links
- Out: Product Tiles → Intelligence Summaries, Valuations, Waterfalls, Documents; directory and Companies menu → every Company Summary; Global Search → firm pages (User Management, Comp Groups, Audit Logs, Firm Settings, Account Settings), company pages (Summary, Financials, Cap Table, Valuation Summary, Waterfall), company documents, valuation versions, company waterfall actions.
- In: the Scalar logo on every screen; the Companies / Date / Search / Notifications overlays are reachable from every screen's Primary Menu.

## Gaps & open questions
- Product glyphs (Ai_graph, Money, table_rows, Doc) and the store icon are SDS_Main icons, not in the package; closest structural glyphs used (Trend, List, Sort, Document).
- Figma's Companies dropdown uses Submenu Items with a trailing chevron; the build uses ComboboxPanel (the DS's documented searchable list for >8 items), which has no chevron.
- The Figma Global Search frame types its Quick Access rows as Document / Version / Company Action while badging them "FIRM PAGE" / "COMPANY PAGE" / "MEASUREMENT DATE" — a PRISM mismatch. Built to the tokens: pages are `page`, dates are `measurement-date`. GlobalSearch renders PRISM group headers ("Pages", "Measurement dates"), not Figma's single "Quick access" header.
- Figma selects the TS firm tile; the build selects the current firm (SV) so the directory title agrees.
- Figma shows the Add New Company button in both Companies-menu frames, so `companies` and `companies-add` render the same panel.
- `.scalar-field` (Input) is `width:100%` + padding with content-box sizing, so it overflows its container by 18px; wrapped in a flex row as a workaround (DS bug to fix).
- App-level: `App.tsx`'s `useEffect(() => window.scrollTo(0, 0))` returns scrollTo's value; in the Claude Browser pane scrollTo returns a Promise, which React calls as a cleanup and crashes every route. Wrap it in braces.
