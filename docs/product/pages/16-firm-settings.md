# 16 · Firm Settings

Firm Settings is where a Firm Admin configures Spatical Ventures as a tenant: its profile and branding, identity (SSO and SCIM provisioning), Daily NAV monitoring defaults and per-company overrides, Scalar AI limits, and firm-wide feature flags. Every tab shares one header — "Firm Settings" with seven section tabs and a positive **Save** action.

## Screens

All tabs sit under `AppFrame area="settings"` + `PageHeader` (tabs: Firm Profile · Single Sign-On · SCIM · Daily NAV Settings · Daily NAV Companies · Scalar AI · Settings, each linking to `routes.firmSettings.*`). Users arrive from the user menu → Firm Settings.

### Firm Profile — `/firm-settings/profile`

Edit the firm's name, address, contact details, and its icon and full logo.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Firm Profile | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-14839) | 11:14839 | `#/firm-settings/profile?state=default` |

Components used: FloatingLabelInput, FloatingLabelSelect, Heading, ImageCropField, Dropzone, Icon (Material `account_balance` placeholder), Button.

Behaviour & rules:
- Name / Street / State / Zip / Phone / Website are editable; Country is required (`*`).
- Each logo slot is an `ImageCropField` (preview well, zoom slider, remove). With no image it shows the placeholder and a `Dropzone` to upload one; an uploaded file previews immediately.

### Single Sign-On — `/firm-settings/sso`

Configure SAML SSO and copy Scalar's service-provider metadata into the IdP.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Single Sign-On | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-18693) | 11:18693 | `#/firm-settings/sso?state=default` |
| Firm Settings — Single Sign-On · Default role menu open | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-21710) | 11:21710 | `#/firm-settings/sso?state=role-menu` |

Components used: FloatingLabelInput, Checkbox, FormField, Select, SelectMenu + SelectMenuOption (open menu), TagInput, CopyField, Heading, Label, Text.

Behaviour & rules:
- Metadata URL is required. Enforced SSO and JIT Provisioning are Checkboxes (need Save).
- Default firm role lists Firm Admin, Analyst, Auditor, Full Access Viewer, Limited Viewer, Export Viewer, Document Viewer; clicking the field opens the drawn menu.
- Email domains: TagInput with "@" prefix; Enter adds a domain; invalid domains are rejected with a message.
- ACS URL and Entity ID are read-only CopyFields.

### SCIM — `/firm-settings/scim`

Enable SCIM provisioning, map IdP groups to Scalar roles, manage the SCIM token.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — SCIM | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=14-9854) | 14:9854 | `#/firm-settings/scim?state=default` |
| Firm Settings — SCIM · Mapping added | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=14-11037) | 14:11037 | `#/firm-settings/scim?state=mapping-added` |

Components used: CopyField (plain and `secret`), Checkbox, Tooltip, Overline, RepeatableRow, Input, Select, Button, AccordionItem, DataGrid, ColumnHeader (`tone="subtle"`), Row, Cell, Pagination (rows per page), Icon (Material `help`, `arrow_forward`, `add`).

Behaviour & rules:
- Mappings: Testers → Limited Viewer, Admins → Analyst, Auditors → Auditor; "Add mapping" appends an empty row (placeholder "e.g. Admins", role Analyst) — the Mapping added state.
- Token is masked after its prefix; Rotate (tertiary) and Revoke (tertiary negative); "Generate new token" primary.
- Revoked Tokens accordion lists scim_eExe2 with created / revoked timestamps; `Pagination` with a rows-per-page control (5 · 10 · 25), pages disabled at 1 of 1.

### Daily NAV Settings — `/firm-settings/daily-nav`

Firm-wide defaults for Daily NAV: alert thresholds, trading market, report recipients and time, CSV report template and delivery.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Daily NAV Settings | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-14082) | 16:14082 | `#/firm-settings/daily-nav?state=default` |
| Firm Settings — Daily NAV Settings · Trading market menu open | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-23323) | 19:23323 | `#/firm-settings/daily-nav?state=market-menu` |
| Firm Settings — Daily NAV Settings · Recipient added | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-23627) | 19:23627 | `#/firm-settings/daily-nav?state=recipient-added` |

Components used: Link, NumberField (`label`, stepper and % suffix), FormField, SaveState, Overline, FloatingLabelSelect, SelectMenu + SelectMenuOption, TimeField, RepeatableRow, Input, Button, Dropzone (`prompt`), FloatingLabelInput, Label, VersionHistoryItem (`currentLabel`), Heading, Text, Icon (Material `add`).

Behaviour & rules:
- Short/Long window: integers 1–31; short must be smaller than long, otherwise the short field errors with how to fix it.
- Capital IQ and Secondary Transaction thresholds are % NumberFields; "% Change from Mark" starts empty.
- SaveState reads "No changes to save." until any field changes; Save and "Apply to open NAV day" stay disabled until then.
- Trading market lists 9 exchanges (XNYS default); menu-open and recipient-added states scroll to their section.
- Recipients: steven.hansen@scalar.io; "Add recipient" appends an empty row (e.g. alerts@firm.com). Delivery has its own recipient list (e.g. delivery@firm.com), SFTP host / Port (21) / Path / Username.
- Report template Dropzone accepts CSV, 15 MB max; prompt "Drop a CSV template or select a file".
- Version History: Aug 24, 2026 5:01 PM — Present, chip "Current — today's NAV and the next", changed by Steven Hansen.

### Daily NAV Companies — `/firm-settings/daily-nav-companies`

Per-company Daily NAV switch, threshold overrides and Alexandria profile link.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Daily NAV Companies | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-27576) | 19:27576 | `#/firm-settings/daily-nav-companies?state=default` |
| Firm Settings — Daily NAV Companies · Alexandria link modal | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-39149) | 19:39149 | `#/firm-settings/daily-nav-companies?state=alexandria-modal` |

Components used: DataGrid (`columns`), ColumnHeader, Row (zebra), Cell (`type="input"`), Link, Chip, CheckboxItem, Input, Button, Pagination (rows per page), Modal (`size="m"`), FormField, Alert, Text, Heading, Icon (Material `search`).

Behaviour & rules:
- Company names link to that company's Daily NAV settings (`routes.company.dailyNavSettings`); "Edit firm defaults." links back to Daily NAV Settings.
- Threshold cells are editable (blue) inputs whose placeholder shows the inherited firm default (1% / 5% / Inherit); unticking Enabled disables the row's inputs.
- "Set" opens the Alexandria modal for that company: search field, helper, info Alert for no match, "Done" closes.
- Lists all 200 companies from the company database, A–Z, 25 per page (rows per page 10 · 25 · 50 · 100). Enabled starts from each record's `dailyNav` flag; a disabled company shows "Off" instead of the NAV-day chip and its threshold inputs are disabled.
- The grid fits 1440 without sideways scroll: text columns are content-width, the seven threshold columns share the rest from zero (`DataGrid columns`), since their inputs' intrinsic width would otherwise overflow.

### Scalar AI — `/firm-settings/scalar-ai`

Cap and default the AI effort level and toggle AI features.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Scalar AI | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-42270) | 19:42270 | `#/firm-settings/scalar-ai?state=default` |
| Firm Settings — Scalar AI · Maximum effort menu open | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-42439) | 19:42439 | `#/firm-settings/scalar-ai?state=max-menu` |
| Firm Settings — Scalar AI · Default effort menu open (capped) | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-42597) | 19:42597 | `#/firm-settings/scalar-ai?state=default-menu` |

Components used: FloatingLabelSelect, SelectMenu + SelectMenuOption, Checkbox, Icon (Material `paid`), Heading.

Behaviour & rules:
- Effort levels: Fastest, Standard, Balanced, High, Maximum; the last three carry a labelled `paid` credits icon (accessible name "Uses extra AI credits").
- **Capped:** Default Selected Effort options above the chosen Maximum Allowed Effort are disabled; lowering the maximum below the default pulls the default down with it.
- Document Auto-Classification off, MCP (Claude Desktop Integration) on.

### Feature Settings — `/firm-settings/settings`

Firm-wide feature flags.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Settings | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-42781) | 19:42781 | `#/firm-settings/settings?state=default` |

Components used: Checkbox, Tooltip, Icon (Material `help`), Heading.

Behaviour & rules:
- Require 2FA (off), Show Process Management Columns (on), Enable Daily NAV (on), Enter values using number format selected (off). Checkboxes, because they apply on Save. Each has an info Tooltip.

## Cross-platform links
- In: user menu → Firm Settings (shell overlay `user-firm-settings`).
- Daily NAV Settings → "View Daily NAV" (`routes.intelligence.dailyNav`).
- Daily NAV Companies → each company's Daily NAV settings (`routes.company.dailyNavSettings`); ↔ Daily NAV Settings via "Edit firm defaults."
- Settings → "Enable Daily NAV" governs whether the Daily NAV tabs and Intelligence → Daily NAV are available.

## Gaps & open questions
- The DS selects are native, so the "menu open" frames pair the field with a `SelectMenu` positioned by the screen (`MenuAnchor` in `FirmSettingsFrame.tsx`); mouse-down on the field opens it instead of the OS list.
- No firm logo asset exists in the repo, so both logo slots start empty (placeholder + Dropzone) where the frame shows uploaded images.
- DS `Select` renders a second native chevron in Chrome (SSO role, SCIM roles, rows-per-page) — the control lacks `appearance: none`; DS fix, reported.
- Tooltip copy on Feature Settings and Group Mapping is guessed.
- "% Change from Mark" shows a red outline in the live app; no error message is known, so it is not rendered as an error.
- Headless / emulated screenshots of the scrolled Daily NAV states (market menu, recipient added) capture the page offset; in a real browser the section is scrolled into view correctly.
