# 11 · Company · Overview & Settings

Company-level profile and monitoring settings. Analysts use Company Overview to check the company's status and the external data attached to it (Capital IQ, EDGAR / Zanbato mutual fund marks), and to resolve a pending common-profile match. Fund admins use Daily NAV Settings to override the firm's Daily NAV alert thresholds for this one company, link its external market-data profile and keep a comps watchlist. In the live app both pages are tabs under **Summary** (Summary Holdings · Company Overview · Daily NAV Settings). The screens therefore render with `section="summary"`, so the Secondary Menu keeps one current item.

Code: `apps/product/src/screens/p11-company-overview-settings/`. It reuses `CompanyChrome.tsx` from page 06.

## Screens

### Company Overview — `/companies/:companyId/overview`
Company profile, status and external data. Users get here from **Company Overview** in Summary's sub-nav, or from **Edit Company** in the ⋮ company actions menu on any Financials page.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Company Overview — Overview](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-27294) | 19:27294 | `#/companies/abc-co/overview?state=default` |

Components used: CompanyLayout, TertiaryMenuItem, CurrencySelector, ButtonIcon, ContextMenu, Banner, Link, SegmentedControl, Card, KeyValueRow, Chip, Tabs, TabItem, Button, EmptyState, Text, Material icons (OpenInNew).

Behaviour & rules:
- A warning Banner flags that the common profile match is pending. Its **Edit Common Profile** link goes to Daily NAV Settings, which holds the External Company Profile.
- "Data as of" switches between the company's as-of date (from the database) and Latest.
- Company Information shows the status chip from the record's `status`: active reads "Operating" (positive tint), exited reads "Exited", written-off reads "Written off" — the word carries the meaning, not the tint. The business description and Capital IQ data are empty in the frame.
- Mutual Fund Marks: the EDGAR / Zanbato tabs, a Chart / Table view switch and an **SEC Filing** action. The empty state is "No mutual fund marks".

### Daily NAV Settings — `/companies/:companyId/daily-nav-settings`
Per-company Daily NAV alert thresholds, the external profile link and the comps watchlist, with a Version History of the config. Users get here from **Daily NAV Settings** in Summary's sub-nav, from **Edit Common Profile** in the company actions menu, or from the Overview banner.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Daily NAV Settings — Top](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-37229) | 19:37229 | `#/companies/abc-co/daily-nav-settings?state=default` |
| scrolled | [Daily NAV Settings — Scrolled to bottom](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-41641) | 19:41641 | `#/companies/abc-co/daily-nav-settings?state=scrolled` |

Components used: CompanyLayout, TertiaryMenuItem, CurrencySelector, Button, Checkbox, SaveState, Overline, NumberField (`label`), Chip, Divider, FormField + Input, Banner, Select, Card, VersionHistoryItem (`currentLabel`), Heading, Text, Material icons (Search, Add).

Behaviour & rules:
- "Include this company in Daily NAV generation" is a Checkbox, because the change needs **Save**. It starts from the record's `dailyNav` flag; ABC Co, the frame's company, starts ticked as drawn.
- Thresholds: Capital IQ has 1 Trading Day Δ, 5 Trading Days Δ and Since Last Valuation Δ. Secondary Transaction has the same three plus % Change from Mark. Each is a `%` NumberField.
- An empty field inherits the firm default, which shows as the placeholder and as an "Inherited (1%)" chip. Any value, including 0, overrides the default, and the chip then reads "Company override".
- SaveState reads "No changes to save" until something changes. **Save** stays disabled until then.
- External Company Profile: the company is not linked. The search field has helper text, and an info Banner shows "No match found".
- Comps Watchlist: the GPC approach Select and Copy Comps are disabled (no GPC approaches yet). **Add Comparable Company/ETF** is the action. The empty text is "No comps added yet."
- Version History: one current version (Aug 24, 2026 5:01 PM — Present, changed by Steven Hansen · Firm template change). **Apply to Open NAV Day** is disabled.
- The `scrolled` state scrolls the window to the bottom on mount, one tick after the app's own scroll-to-top.

## Cross-platform links
- In: the company actions menu on the Financials pages (page 06), Summary's sub-nav on every Summary tab, and the Overview banner.
- Related: the firm-wide defaults these fields inherit live in Firm Settings → Daily NAV (`routes.firmSettings.dailyNav`, page 16). They are not linked from the frame.

## Gaps & open questions
- The lead brief said `section="overview"`. The frames and the live app show these pages under **Summary** (Summary is highlighted in the Secondary Menu), so `section="summary"` was used. `overview` would leave no Secondary item current.
- ABC Co's record has `dailyNav: false`, but the frame shows the company included. The screen special-cases ABC Co so the frame holds; the record (or the frame) should be reconciled.
- "SEC Filing" has no destination in the frame, so it does nothing.

## Prototype — Company Overview v2 (`/prototypes/company-overview-v2/:companyId`)
Code: `apps/product/src/screens/prototypes/company-overview-v2/`. States: `default`, `board-short`, `board-long` (short/long AI-generated board content).
- **ZX Index Value**: Zanbato | Forge | Caplight `SegmentedControl` and the range toggle re-drive the `LineChart` and the 7 stat tiles from one dataset per provider (`data.ts`). Robustness Score sits in the card header (`InformationLabel` + `Chip`).
- **Stat tile** (`StatTile.tsx`): neutral on `bg.subtle`; any % delta above +5% or below −5% takes `bg.warningSubtle`, a warning stroke, and the words "Beyond ±5%" (colour alone never carries it).
- **Public Comps**: mirrors the ZX chrome; range + Chart/Table toggles; the `LineChart` legend supplies the Public Comps / Peer Group chips; 6 tiles.
- **Board Presentations**: title + "View Presentation" link (new tab), deck name/date, overview, 3 equal tiles, 5 highlights — all wrap, none clip.
- Mutual Fund Marks, Fundraising Rounds, Financial History, News are out-of-scope placeholders.

Gaps: (1) `StatTile` is screen-local (ladder rung 6); promote to `src/components/` + Figma if approved. (2) The duplicated stat row / Financial History in production is not present in this code — engineering bug ticket. (3) No coded 409A public-comps chart exists; the DS `LineChart` stands in. (4) "View Presentation" has no real PDF target.
