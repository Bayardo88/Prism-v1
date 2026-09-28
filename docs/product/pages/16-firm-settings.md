# 16 · Firm Settings

Firm Settings is where a Firm Admin configures Spatical Ventures as a tenant: its profile and branding, identity (SSO and SCIM provisioning), Daily NAV monitoring defaults and per-company overrides, Scalar AI limits, and firm-wide feature flags. Every tab shares one header — "Firm Settings" with seven section tabs and a positive **Save** action.

## Screens

All tabs sit under `AppFrame area="settings"` + `PageHeader` (tabs: Firm Profile · Single Sign-On · SCIM · Daily NAV Settings · Daily NAV Companies · Scalar AI · Settings, each linking to `routes.firmSettings.*`). Users arrive from the user menu → Firm Settings.

### Firm Profile — `/firm-settings/profile`

Edit the firm's name, address, contact details, and its icon and full logo.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Firm Profile | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-14839) | 11:14839 | `#/firm-settings/profile?state=default` |

Components used: FloatingLabelInput, FloatingLabelSelect, Heading, Avatar, Slider, ButtonIcon, Icon, Text, Button.

Behaviour & rules:
- Name / Street / State / Zip / Phone / Website are editable; Country is required (`*`).
- Each logo slot has a preview well, a zoom Slider and a negative remove ButtonIcon.

### Single Sign-On — `/firm-settings/sso`

Configure SAML SSO and copy Scalar's service-provider metadata into the IdP.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Single Sign-On | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-18693) | 11:18693 | `#/firm-settings/sso?state=default` |
| Firm Settings — Single Sign-On · Default role menu open | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-21710) | 11:21710 | `#/firm-settings/sso?state=role-menu` |

Components used: FloatingLabelInput, Checkbox, FormField, Select, ComboboxOption (open menu), TagInput, CopyField, Heading, Label, Text.

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

Components used: CopyField (plain and `secret`), Checkbox, Tooltip, Overline, RepeatableRow, Input, Select, Button, AccordionItem, DataGrid, ColumnHeader, Row, Cell, Pagination.

Behaviour & rules:
- Mappings: Testers → Limited Viewer, Admins → Analyst, Auditors → Auditor; "Add mapping" appends an empty row (placeholder "e.g. Admins", role Analyst) — the Mapping added state.
- Token is masked after its prefix; Rotate (tertiary) and Revoke (tertiary negative); "Generate new token" primary.
- Revoked Tokens accordion lists scim_eExe2 with created / revoked timestamps; pagination disabled at 1 of 1.

### Daily NAV Settings — `/firm-settings/daily-nav`

Firm-wide defaults for Daily NAV: alert thresholds, trading market, report recipients and time, CSV report template and delivery.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Daily NAV Settings | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=16-14082) | 16:14082 | `#/firm-settings/daily-nav?state=default` |
| Firm Settings — Daily NAV Settings · Trading market menu open | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-23323) | 19:23323 | `#/firm-settings/daily-nav?state=market-menu` |
| Firm Settings — Daily NAV Settings · Recipient added | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-23627) | 19:23627 | `#/firm-settings/daily-nav?state=recipient-added` |

Components used: Link, FormField, NumberField (stepper and % suffix), SaveState, Overline, FloatingLabelSelect, ComboboxOption, TimeField, RepeatableRow, Input, Button, Dropzone, FloatingLabelInput, Label, VersionHistoryItem, Heading, Text.

Behaviour & rules:
- Short/Long window: integers 1–31; short must be smaller than long, otherwise the short field errors with how to fix it.
- Capital IQ and Secondary Transaction thresholds are % NumberFields; "% Change from Mark" starts empty.
- SaveState reads "No changes to save." until any field changes; Save and "Apply to open NAV day" stay disabled until then.
- Trading market lists 9 exchanges (XNYS default); menu-open and recipient-added states scroll to their section.
- Recipients: steven.hansen@scalar.io; "Add recipient" appends an empty row (e.g. alerts@firm.com). Delivery has its own recipient list (e.g. delivery@firm.com), SFTP host / Port (21) / Path / Username.
- Report template Dropzone accepts CSV, 15 MB max.
- Version History: Aug 24, 2026 5:01 PM — Present, current, changed by Steven Hansen.

### Daily NAV Companies — `/firm-settings/daily-nav-companies`

Per-company Daily NAV switch, threshold overrides and Alexandria profile link.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Daily NAV Companies | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-27576) | 19:27576 | `#/firm-settings/daily-nav-companies?state=default` |
| Firm Settings — Daily NAV Companies · Alexandria link modal | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-39149) | 19:39149 | `#/firm-settings/daily-nav-companies?state=alexandria-modal` |

Components used: DataGrid, ColumnHeader, Row, Cell (`type="input"`), Link, Chip, CheckboxItem, Input, Button, Modal, FormField, Alert, Text, Heading.

Behaviour & rules:
- Company names link to that company's Daily NAV settings (`routes.company.dailyNavSettings`); "Edit firm defaults." links back to Daily NAV Settings.
- Threshold cells are editable (blue) inputs whose placeholder shows the inherited firm default (1% / 5% / Inherit); unticking Enabled disables the row's inputs.
- "Set" opens the Alexandria modal for that company: search field, helper, info Alert for no match, "Done" closes.
- Companies = shared fixtures plus the rest of the frame's list, sorted A–Z.

### Scalar AI — `/firm-settings/scalar-ai`

Cap and default the AI effort level and toggle AI features.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Scalar AI | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-42270) | 19:42270 | `#/firm-settings/scalar-ai?state=default` |
| Firm Settings — Scalar AI · Maximum effort menu open | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-42439) | 19:42439 | `#/firm-settings/scalar-ai?state=max-menu` |
| Firm Settings — Scalar AI · Default effort menu open (capped) | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-42597) | 19:42597 | `#/firm-settings/scalar-ai?state=default-menu` |

Components used: FloatingLabelSelect, ComboboxOption, Checkbox, Heading.

Behaviour & rules:
- Effort levels: Fastest, Standard, Balanced, High, Maximum; the last three carry "Uses extra AI credits" (words, not only a glyph — R8).
- **Capped:** Default Selected Effort options above the chosen Maximum Allowed Effort are disabled; lowering the maximum below the default pulls the default down with it.
- Document Auto-Classification off, MCP (Claude Desktop Integration) on.

### Feature Settings — `/firm-settings/settings`

Firm-wide feature flags.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| Firm Settings — Settings | [link](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=19-42781) | 19:42781 | `#/firm-settings/settings?state=default` |

Components used: Checkbox, Tooltip, Icon, Heading.

Behaviour & rules:
- Require 2FA (off), Show Process Management Columns (on), Enable Daily NAV (on), Enter values using number format selected (off). Checkboxes, because they apply on Save. Each has an info Tooltip.

## Cross-platform links
- In: user menu → Firm Settings (shell overlay `user-firm-settings`).
- Daily NAV Settings → "View Daily NAV" (`routes.intelligence.dailyNav`).
- Daily NAV Companies → each company's Daily NAV settings (`routes.company.dailyNavSettings`); ↔ Daily NAV Settings via "Edit firm defaults."
- Settings → "Enable Daily NAV" governs whether the Daily NAV tabs and Intelligence → Daily NAV are available.

## Gaps & open questions
- The DS `Select`/`FloatingLabelSelect` are native; the "menu open" frames are drawn with ComboboxOption rows on a raised surface (`OptionMenu.tsx`) — a DS "select menu" surface is missing.
- No DS logo cropper: the Firm icon / full logo previews use Avatar + text instead of the uploaded image.
- The premium-effort glyph (credits coin) is not in the glyph set; replaced by the "Uses extra AI credits" line.
- Tooltip copy on Feature Settings and Group Mapping is guessed.
- "Current — today's NAV and the next" chip text: `VersionHistoryItem` renders a fixed "Current" chip, so the rest moved into the meta line.
- Revoked-tokens "Rows per page" selector is plain text (no DS rows-per-page control).
- "% Change from Mark" shows a red outline in the live app; no error message is known, so it is not rendered as an error.
