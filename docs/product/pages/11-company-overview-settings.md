# 11 · Company · Overview & Settings

Company-level profile and monitoring settings. Analysts use Company Overview to check the company's status and the external data attached to it (Capital IQ, EDGAR / Zanbato mutual fund marks), and to resolve a pending common-profile match. Fund admins use Daily NAV Settings to override the firm's Daily NAV alert thresholds for this one company, link its external market-data profile and keep a comps watchlist. In the live app both pages are tabs under **Summary** (Summary Holdings · Company Overview · Daily NAV Settings). The screens therefore render with `section="summary"`, so the Secondary Menu keeps one current item.

Code: `apps/product/src/screens/p11-company-overview-settings/`. It reuses `CompanyChrome.tsx` from page 06.

## Screens

### Company Overview — `/companies/:companyId/overview`
Company profile, status and external data. Users get here from **Company Overview** in Summary's sub-nav, or from **Edit Company** in the ⋮ company actions menu on any Financials page.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Company Overview — Overview](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-27294) | 19:27294 | `#/companies/abc-co/overview?state=default` |

Components used: CompanyLayout, TertiaryMenuItem, CurrencySelector, ButtonIcon, ContextMenu, Banner, Link, SegmentedControl, Card, KeyValueRow, Chip, Tabs, TabItem, Button, EmptyState, Text.

Behaviour & rules:
- A warning Banner flags that the common profile match is pending. Its **Edit Common Profile** link goes to Daily NAV Settings, which holds the External Company Profile.
- "Data as of" switches between 2024-12-31 and Latest.
- Company Information shows the status chip (Operating), with a positive tint plus the word itself. The business description and Capital IQ data are empty in the frame.
- Mutual Fund Marks: the EDGAR / Zanbato tabs, a Chart / Table view switch and an **SEC Filing** action. The empty state is "No mutual fund marks".

### Daily NAV Settings — `/companies/:companyId/daily-nav-settings`
Per-company Daily NAV alert thresholds, the external profile link and the comps watchlist, with a Version History of the config. Users get here from **Daily NAV Settings** in Summary's sub-nav, from **Edit Common Profile** in the company actions menu, or from the Overview banner.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Daily NAV Settings — Top](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-37229) | 19:37229 | `#/companies/abc-co/daily-nav-settings?state=default` |
| scrolled | [Daily NAV Settings — Scrolled to bottom](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-41641) | 19:41641 | `#/companies/abc-co/daily-nav-settings?state=scrolled` |

Components used: CompanyLayout, TertiaryMenuItem, CurrencySelector, Button, Checkbox, SaveState, Overline, FormField, NumberField, Chip, Divider, Input, Banner, Select, Card, VersionHistoryItem, Heading, Text.

Behaviour & rules:
- "Include this company in Daily NAV generation" is a Checkbox, because the change needs **Save**.
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
- VersionHistoryItem's current chip is fixed to "Current". The frame's "Current — today's NAV and the next" text is moved into `meta`.
- Figma uses floating-label Number Fields. NumberField has no label of its own, so each one is wrapped in a `FormField` label.
- "SEC Filing" has no destination in the frame, so it does nothing.
