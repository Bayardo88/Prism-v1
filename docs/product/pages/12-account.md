# 12 · Account Settings

The signed-in user's own account: personal data, email preferences, UI zoom, connected MCP apps, profile picture and two-factor authentication. Every user (analyst, auditor, firm admin) has it; it is reached from the avatar → user menu → Account.

## Screens

### Account Settings — `/account/settings`
Edit name and email, send a password reset, choose which emails to receive, set the application zoom, see connected apps and upload a profile picture. Tabs switch to Two-Factor Authentication.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Account — Settings](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-16416) | 11:16416 | `#/account/settings` |

Components used: AppFrame, PageHeader (SecondaryMenuItem tabs), Button, FloatingLabelInput, Checkbox, Label, Select, ButtonIcon, Heading, Text, Icon (`icons.Mail`, `FitScreen`, `CheckCircle`), AppFooter, Dropzone (`prompt`), ImageCropField.

Behaviour & rules:
- Name and email default from the signed-in user fixture. Save (primary, positive) is disabled until something changes.
- "Send password reset email" is immediate and confirms inline ("Reset link sent to …").
- Email preferences are Checkboxes (they need Save), not Switches.
- Application body zoom: 75–125 %, default 85 %; the fit-to-screen button resets to 100 %.
- Profile Picture: Dropzone with the frame's prompt ("Drag & Drop Profile Picture or Select a file"), JPG only, 15 MB max. Once a file is chosen an ImageCropField previews it with a zoom slider and a delete button.
- Connected Apps empty state: "No connected apps. Connect an MCP-compatible application to see it here."

### Two-Factor Authentication — `/account/two-factor`
See whether 2FA is on and manage the one-time backup codes.

| State | Figma frame | Node | Open with |
|---|---|---|---|
| default | [Account — Two-Factor Authentication](https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=11-20549) | 11:20549 | `#/account/two-factor` |

Components used: AppFrame, PageHeader, Accordion, AccordionItem, Switch, Text, CodeGrid, Button, Icon (`icons.CloudDownload`, `Print`, `Refresh`), ConfirmationDialog.

Behaviour & rules:
- The firm policy requires 2FA, so the switch is on and disabled, with the reason stated above it.
- Ten backup codes; Download codes saves a .txt, Print codes prints the page.
- Generate new codes asks for confirmation (old codes stop working), then replaces all ten.

## Cross-platform links
- In: avatar → user menu → Account (UserMenuOverlay, owned elsewhere); Global Search → "Account Settings".
- Out: tabs between the two screens only.

## Gaps & open questions
- The Figma Save is Button Size=S; the DS reserves size S for dense grid furniture, so the build uses M.
- Last name: the fixture user has no surname beyond "V"; Figma showed a real name, not reproduced.
- The profile picture and email preferences are not persisted (no user store).
