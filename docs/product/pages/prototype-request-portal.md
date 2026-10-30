# Prototype · Unified Request Portal

**Route:** `#/prototypes/request-portal/:requestId` (e.g. `abc-co-request`)
**Source:** `SCALAR_UNIFIED_REQUEST_PORTAL_IMPLEMENTATION_TODO.md` (review of the Figma Make prototype `HiOm04NapSHEgQ1wpzwTgn`, 2026-10-30). No Figma frames yet: states are `proto:request-portal:<n>`.
**Code:** `apps/product/src/screens/prototypes/request-portal/` · templates in `apps/product/assets/templates/`

## Purpose

An external contact works through a PPA information request: one numbered list where questions and documents are the same kind of thing, each asking for exactly one kind of response. They download Scalar's templates, complete them offline, and upload them back to the same request.

## How users get here

From the request email (no Scalar login). In the product: **Company › Documents › Information Request › Preview unified portal** (next to *Preview respondent page*).

## States (fixture sets, same list component)

`default` (27 mixed) · `questions-only` · `documents-only` · `templates-only` · `all-complete` · `empty`. Each state persists separately in localStorage; **Reset prototype data** restores the fixture.

## Logic

1. **Contract** (`model.ts`): wording (`title`, `description`) is independent of `responseType` (`text` · `choice` · `date` · `file` · `template_file`). Number = `categoryOrder.requestOrder` from the data, so filtering, selecting, completing and reopening never renumber.
2. **One derived model.** The ring, "N remaining", category tallies and filters all read the same `requests` array.
3. **Lifecycle** (`store.ts`): validating → uploading (progress) → saving → Complete, or failed. A request turns Complete **only** after the save resolves; a failure keeps it Pending, shows a negative `Alert` and allows a retry. What was typed survives a failed save.
4. **Validation:** extension and 15 MB size are checked in code, with a file-specific message. `Dropzone` is given no `accept`, because it silently discards a non-matching dropped file.
5. **Templates:** one request holds *Step 1 · Template provided by Scalar* (name, CSV, version, issue date, Download) and *Step 2 · Upload the completed template*. Download fetches the real asset and saves it as `text/csv` with its own filename; a missing asset (request 1.3) shows *Template unavailable*. The download stays available after completion.
6. **Statuses:** `pending` · `complete` · `na` · `sent`. N/A and *sent another way* resolve a request but never imply a file arrived. **Reopen** returns it to Pending immediately and keeps the saved answer/files attached and editable. Uploading again keeps earlier versions listed.
7. **Selection:** Select All acts on the visible subset (category + status filter); selection is pruned whenever the filter changes, and bulk actions act on selected ∩ visible ∩ eligible, with counts in the menu.
8. **Every control does something:** Login, Contact Us, Privacy Policy, How do I use this?, *Due … · Extend* and Delegate open dialogs that validate, confirm and can fail (with the failure toggle on).

## Components

`PageTemplate` (navigation · companyInfo · subNavigation) · `PrimaryMenu` + `MainMenuItem` (Login) · `CompanyInfo` + `SecondaryMenu` · `TertiaryMenu` · `ProgressBar` + `InformationLabel` · `FilterDropdown` + `SelectMenu` · `Checkbox` · `Button` + `ContextMenu` (bulk) · `SubmenuItem` (categories) · `Select` (mobile categories) · `Chip` (status, word + icon) · `FormField` / `Textarea` / `Input` / `RadioGroup` · `Dropzone` · `FileRow` · `Alert` · `Banner` · `EmptyState` · `Modal` · `Toast`.

## Prototype-only

Answers live in localStorage and file bytes in IndexedDB, in this browser only. Nothing is transmitted, encrypted or scanned, and the page says so. Security (P0.9), real delegation notifications and a server-provided deadline are out of scope.

## Gaps

- **Progress is a `ProgressBar`, not a ring.** `ProgressRing` is 48px and the Secondary Menu bar is 32px; at 32px its 12px label collided with the stroke. The bar (`7/27 ▬▬ 26%` plus an `InformationLabel` "Remaining 20 requests": brand while work is left, positive when all resolved) fits the tier with room to spare and is the AI-GUIDE §5 choice for progress with a known total.
- **Clickable `Chip` is a toggle** (`aria-pressed`), so the deadline is a tertiary `Button`, not a chip.
- **Templates are CSV.** Real `.xlsx` assets need a content sign-off on columns (G3.3) before they replace these.
